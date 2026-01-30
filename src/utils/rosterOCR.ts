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
 * Expected format: Division header at top, then multiple teams with their rosters
 * Each roster image contains an entire division with 4 teams
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
  console.log(`[parseRosterText] First 20 lines:`, lines.slice(0, 20));

  // The first line is typically the division name (e.g., "East Division")
  // We need to extract ALL teams from this division
  // For now, we'll treat the entire image as one combined roster
  // and extract all players, letting the team name be the division name
  
  const divisionName = lines[0];
  console.log(`[parseRosterText] Division: "${divisionName}"`);
  
  // Extract ALL players from all lines
  const allPlayers: string[] = [];
  
  for (const line of lines.slice(1)) {
    const lower = line.toLowerCase();
    
    // Skip headers and labels
    if (lower.includes('pitcher') && lower.includes('total') ||
        lower.includes('hitter') && lower.includes('total') ||
        lower.includes('roster total') ||
        lower.includes('cash') ||
        lower.includes('total value') ||
        lower.length < 10) {
      continue;
    }
    
    // Extract all players from this line
    const players = extractAllPlayersFromLine(line);
    allPlayers.push(...players);
  }
  
  console.log(`[parseRosterText] Total players extracted: ${allPlayers.length}`);
  console.log(`[parseRosterText] Sample players:`, allPlayers.slice(0, 10));

  // For now, return all players as hitters (we'll separate them later based on position)
  // The team name will be the division name
  return {
    teamName: divisionName,
    hitters: allPlayers,
    pitchers: []
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
