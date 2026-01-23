import Tesseract from 'tesseract.js';

export interface ExtractedCardData {
  playerName: string;
  year?: string;
  balance?: string;
  stealRating?: string;
  runRating?: string;
  bunting?: string;
  hitAndRun?: string;
  defense?: {
    [position: string]: {
      range: number;
      error: number;
      arm?: number;
      throwing?: string;
    };
  };
  hitting?: {
    vsLefty?: {
      column1: string[];
      column2: string[];
      column3: string[];
    };
    vsRighty?: {
      column4: string[];
      column5: string[];
      column6: string[];
    };
  };
  pitching?: {
    vsLefty?: {
      column1: string[];
      column2: string[];
      column3: string[];
    };
    vsRighty?: {
      column4: string[];
      column5: string[];
      column6: string[];
    };
    endurance?: string;
  };
}

export async function extractCardStats(imageUrl: string): Promise<ExtractedCardData> {
  const img = new Image();
  img.src = imageUrl;
  await new Promise((resolve) => { img.onload = resolve; });

  // Extract player name from top header
  const headerData = await extractHeader(img);
  
  // Extract main card stats
  const statsData = await extractMainStats(img);
  
  return {
    playerName: headerData.playerName || 'Unknown Player',
    ...headerData,
    ...statsData
  };
}

async function extractHeader(img: HTMLImageElement): Promise<Partial<ExtractedCardData>> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return {};
  
  // Crop top 15% for header
  const topHeight = Math.min(150, img.height * 0.15);
  canvas.width = img.width;
  canvas.height = topHeight;
  ctx.drawImage(img, 0, 0, img.width, topHeight, 0, 0, img.width, topHeight);
  
  const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng', {
    logger: () => {}
  });

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let playerName = '';
  let year = '';
  
  for (const line of lines) {
    const nameYearMatch = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\((\d{4})\)/i);
    if (nameYearMatch) {
      playerName = nameYearMatch[1].trim();
      year = nameYearMatch[2];
      break;
    }
  }

  return { playerName, year };
}

async function extractMainStats(img: HTMLImageElement): Promise<Partial<ExtractedCardData>> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return {};
  
  // Extract middle section with stats (skip header, get main card area)
  const startY = img.height * 0.15;
  const height = img.height * 0.7;
  canvas.width = img.width;
  canvas.height = height;
  ctx.drawImage(img, 0, startY, img.width, height, 0, 0, img.width, height);
  
  const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng', {
    logger: () => {}
  });

  const result: Partial<ExtractedCardData> = {};
  
  // Extract Balance (e.g., "Balance: 1R" or "9L")
  const balanceMatch = text.match(/Balance[:\s]*(\d*[LRE])/i);
  if (balanceMatch) {
    result.balance = balanceMatch[1];
  }
  
  // Extract Stealing rating (e.g., "stealing-(A)" or "*(3-6)")
  const stealMatch = text.match(/stealing[:\s-]*\(([A-E]{1,3})\)/i);
  if (stealMatch) {
    result.stealRating = stealMatch[1];
  }
  
  // Extract Running rating (e.g., "running 1-13")
  const runMatch = text.match(/running[:\s]*(1-\d{2})/i);
  if (runMatch) {
    result.runRating = runMatch[1];
  }
  
  // Extract Bunting (e.g., "bunting-C")
  const buntMatch = text.match(/bunting[:\s-]*([A-D])/i);
  if (buntMatch) {
    result.bunting = buntMatch[1];
  }
  
  // Extract Hit & Run (e.g., "hit & run-B")
  const hitRunMatch = text.match(/hit\s*&\s*run[:\s-]*([A-D])/i);
  if (hitRunMatch) {
    result.hitAndRun = hitRunMatch[1];
  }
  
  // Extract Defense ratings
  result.defense = extractDefense(text);
  
  // Extract Hitting columns (if hitter)
  const hittingColumns = extractHittingColumns(text);
  if (hittingColumns) {
    result.hitting = hittingColumns;
  }
  
  // Extract Pitching columns (if pitcher)
  const pitchingColumns = extractPitchingColumns(text);
  if (pitchingColumns) {
    result.pitching = pitchingColumns;
  }
  
  return result;
}

function extractDefense(text: string): { [position: string]: any } | undefined {
  const defense: { [position: string]: any } = {};
  
  // Look for defense patterns like "c-1(-5)e1" or "1b-2e5"
  const defensePattern = /([a-z]{1,2})-(\d)\(?([-+]?\d+)?\)?e(\d+)/gi;
  const matches = text.matchAll(defensePattern);
  
  for (const match of matches) {
    const position = match[1].toUpperCase();
    const range = parseInt(match[2]);
    const arm = match[3] ? parseInt(match[3]) : undefined;
    const error = parseInt(match[4]);
    
    defense[position] = { range, error, arm };
  }
  
  // Look for throwing rating for catchers (e.g., "T-1")
  const throwingMatch = text.match(/T-(\d)/i);
  if (throwingMatch && defense['C']) {
    defense['C'].throwing = `T-${throwingMatch[1]}`;
  }
  
  return Object.keys(defense).length > 0 ? defense : undefined;
}

function extractHittingColumns(text: string): any {
  // Look for hitting result patterns
  // Columns are typically labeled with numbers or "vs LEFTY PITCHERS" / "vs RIGHTY PITCHERS"
  
  const hitting: any = {
    vsLefty: { column1: [], column2: [], column3: [] },
    vsRighty: { column4: [], column5: [], column6: [] }
  };
  
  // This is a simplified extraction - in practice, you'd need more sophisticated
  // parsing based on the exact card layout
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Look for result patterns with dice rolls (e.g., "1-10 HR", "11-15 SI")
    const resultMatch = line.match(/(\d+-\d+)\s+([A-Z]+)/);
    if (resultMatch) {
      // This would need more logic to determine which column
      // For now, this is a placeholder
    }
  }
  
  // Return undefined if no columns found
  if (hitting.vsLefty.column1.length === 0 && hitting.vsRighty.column4.length === 0) {
    return undefined;
  }
  
  return hitting;
}

function extractPitchingColumns(text: string): any {
  // Similar to hitting columns but for pitchers
  // Look for pitching results and endurance ratings
  
  const enduranceMatch = text.match(/(S\d|R\d|C\d)/i);
  
  if (enduranceMatch) {
    return {
      vsLefty: { column1: [], column2: [], column3: [] },
      vsRighty: { column4: [], column5: [], column6: [] },
      endurance: enduranceMatch[1]
    };
  }
  
  return undefined;
}
