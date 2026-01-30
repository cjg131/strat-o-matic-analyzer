import Tesseract from 'tesseract.js';

export interface RosterData {
  teamName: string;
  hitters: string[];
  pitchers: string[];
}

/**
 * Extract text from an image using Tesseract OCR
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse extracted OCR text to identify team name and player lists
 * Expected format: Team name at top, followed by player names
 */
export function parseRosterText(text: string): RosterData {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('No text found in image');
  }

  console.log(`[parseRosterText] Total OCR lines: ${lines.length}`);
  console.log(`[parseRosterText] First 10 lines:`, lines.slice(0, 10));

  // First line is typically the team name
  const teamName = lines[0];
  console.log(`[parseRosterText] Team name: "${teamName}"`);
  
  // Remaining lines are player names
  // Filter out common headers and non-player text
  const playerLines = lines.slice(1).filter(line => {
    const lower = line.toLowerCase();
    // Skip common headers and labels
    if (lower.includes('hitter') || 
        lower.includes('pitcher') ||
        lower.includes('position') ||
        lower.includes('salary') ||
        lower.includes('total') ||
        lower.length < 3) {
      console.log(`[parseRosterText] Skipping header/label: "${line}"`);
      return false;
    }
    return true;
  });
  
  console.log(`[parseRosterText] Player lines after filtering: ${playerLines.length}`);

  // Separate hitters and pitchers
  // Look for section markers or assume first half are hitters
  const hitters: string[] = [];
  const pitchers: string[] = [];
  
  let currentSection: 'hitters' | 'pitchers' = 'hitters';
  
  for (const line of playerLines) {
    const lower = line.toLowerCase();
    
    // Check for section markers
    if (lower.includes('pitcher') || lower.includes('pitching')) {
      currentSection = 'pitchers';
      continue;
    }
    
    // Extract ALL players from this line (may contain multiple players in multi-column format)
    const cleanNames = extractAllPlayersFromLine(line);
    for (const cleanName of cleanNames) {
      if (currentSection === 'hitters') {
        hitters.push(cleanName);
      } else {
        pitchers.push(cleanName);
      }
    }
  }

  // If no section markers found, try to split by position
  // Assume players with 'P' position are pitchers
  if (pitchers.length === 0 && hitters.length > 0) {
    const allPlayers = [...hitters];
    hitters.length = 0;
    
    for (const player of allPlayers) {
      // Simple heuristic: if name contains position indicators
      if (player.match(/\bP\b/i)) {
        pitchers.push(player);
      } else {
        hitters.push(player);
      }
    }
  }

  return {
    teamName,
    hitters,
    pitchers
  };
}

/**
 * Extract all player names from a single OCR line that may contain multiple players
 * Example input: "Cash .00M Flick, E. (1905) I L RF 6.36M Cash .07M Harper, B. (2015)"
 * Should extract: ["Flick, E. (1905)", "Harper, B. (2015)"]
 */
function extractAllPlayersFromLine(rawLine: string): string[] {
  const players: string[] = [];
  
  console.log(`[extractAllPlayersFromLine] Input: "${rawLine}"`);
  
  // Remove common OCR artifacts
  let cleaned = rawLine
    .replace(/[|]/g, 'I')
    .replace(/[`']/g, "'")
    .trim();
  
  // Global regex to find ALL occurrences of player pattern: "LastName, I. (Year)"
  // This will match multiple players in the same line
  const regex = /([A-Za-z'\-\s]+),\s*([A-Z]\.?)\s*\((\d{4})\)/g;
  
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    const lastName = match[1].trim();
    const initial = match[2].replace('.', '').trim();
    const year = match[3];
    
    const result = `${lastName}, ${initial}. (${year})`;
    console.log(`[extractAllPlayersFromLine] Found player: "${result}"`);
    players.push(result);
  }
  
  if (players.length === 0) {
    console.log(`[extractAllPlayersFromLine] ❌ No players found in: "${rawLine}"`);
  }
  
  return players;
}


/**
 * Process multiple roster images and combine results
 */
export async function processRosterImages(imageFiles: File[]): Promise<RosterData[]> {
  const results: RosterData[] = [];
  
  for (const file of imageFiles) {
    try {
      const text = await extractTextFromImage(file);
      const rosterData = parseRosterText(text);
      results.push(rosterData);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      throw error;
    }
  }
  
  return results;
}

/**
 * Convert roster data to the format expected by roster-assignments.json
 */
export function convertToRosterAssignments(rosterDataList: RosterData[]): Record<string, any> {
  const rosters: Record<string, any> = {};
  
  for (const rosterData of rosterDataList) {
    // Use the exact team name as the key (matching roster-assignments.json format)
    rosters[rosterData.teamName] = {
      hitters: rosterData.hitters,
      pitchers: rosterData.pitchers
    };
  }
  
  return { rosters };
}
