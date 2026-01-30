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
 * 
 * Team name pattern: "TeamName (W-L)" e.g., "Manhattan WOW Award Stars (9-12)"
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

  // Look for team name patterns: "Team Name (W-L)" like "Manhattan WOW Award Stars (9-12)"
  // Team names appear before player lists and often have a record in parentheses
  const teamNamePattern = /^([A-Za-z\s']+(?:II|III|IV)?)\s*\((\d+-\d+)\)/;
  
  let currentTeamName = lines[0]; // Default to division name if no team found
  const allPlayers: string[] = [];
  
  for (const line of lines) {
    // Check if this line is a team name
    const teamMatch = line.match(teamNamePattern);
    if (teamMatch) {
      currentTeamName = teamMatch[1].trim();
      console.log(`[parseRosterText] Found team: "${currentTeamName}" (${teamMatch[2]})`);
      continue;
    }
    
    const lower = line.toLowerCase();
    
    // Skip headers and labels
    if (lower.includes('division') ||
        lower.includes('pitcher') && lower.includes('total') ||
        lower.includes('hitter') && lower.includes('total') ||
        lower.includes('roster total') ||
        lower.includes('cash') ||
        lower.includes('total value') ||
        lower.includes('pitchers') ||
        lower.includes('hitters') ||
        lower.length < 10) {
      continue;
    }
    
    // Extract all players from this line
    const players = extractAllPlayersFromLine(line);
    allPlayers.push(...players);
  }
  
  console.log(`[parseRosterText] Team: "${currentTeamName}"`);
  console.log(`[parseRosterText] Total players extracted: ${allPlayers.length}`);
  console.log(`[parseRosterText] Sample players:`, allPlayers.slice(0, 10));

  // Return all players as hitters (we'll separate them later based on position)
  return {
    teamName: currentTeamName,
    hitters: allPlayers,
    pitchers: []
  };
}

/**
 * Extract all player names from a single OCR line that may contain multiple players
 * Example input: "Cash .00M Flick, E. (1905) I L RF 6.36M Cash .07M Harper, B. (2015)"
 * Should extract: ["Flick, E. (1905)", "Harper, B. (2015)"]
 * 
 * Also handles team abbreviation prefixes like "M Jenkins, F. (1968)" -> "Jenkins, F. (1968)"
 */
function extractAllPlayersFromLine(rawLine: string): string[] {
  const players: string[] = [];

  console.log(`[extractAllPlayersFromLine] Input: "${rawLine}"`);

  // Remove common OCR artifacts
  let cleaned = rawLine
    .replace(/[|]/g, 'I')
    .replace(/[`']/g, "'")
    .trim();

  // Global regex to find ALL occurrences of player pattern
  // Handles optional team prefix: "M LastName, I. (Year)" or "LastName, I. (Year)"
  // The (?:[A-Z]\s+)? part matches an optional single letter followed by space (team abbreviation)
  const regex = /(?:[A-Z]\s+)?([A-Za-z'\-\s]+),\s*([A-Z]\.?)\s*\((\d{4})\)/g;

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
