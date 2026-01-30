import rosterData from '../../roster-assignments.json';

/**
 * Assigns roster names to players based on the roster-assignments.json file
 * Matches players by name and year in format "LastName, Initial (Year)"
 * @param playerName - Player name in format "LastName, FirstName"
 * @param year - Player season year
 * @param customRosterData - Optional custom roster data to use instead of default file
 */
export function assignRosterToPlayer(playerName: string, year: string, customRosterData?: any): string | undefined {
  // Parse the player name to extract last name and first initial
  // Handle formats like "Ruth, Babe" or "Ruth, B." or "Ruth, B" or "Griffey Jr, Ken"
  const nameParts = playerName.split(',').map(p => p.trim());
  if (nameParts.length < 2) {
    console.warn(`[Roster Assignment] Invalid name format: "${playerName}"`);
    return undefined; // Can't match without proper format
  }
  
  const lastName = nameParts[0].trim();
  const firstName = nameParts[1].trim();
  const firstInitial = firstName.charAt(0).toUpperCase();
  
  // Use custom roster data if provided, otherwise use default
  const dataToUse = customRosterData || rosterData;
  
  // DEBUG: Log what we're working with
  console.log(`[DEBUG] Trying to match: "${playerName}" (${year})`);
  console.log(`[DEBUG] Parsed as: lastName="${lastName}", firstName="${firstName}", initial="${firstInitial}"`);
  console.log(`[DEBUG] Using ${customRosterData ? 'CUSTOM' : 'DEFAULT'} roster data`);
  if (customRosterData) {
    console.log(`[DEBUG] Custom data structure:`, Object.keys(dataToUse));
  }
  
  // Search through all rosters
  for (const [rosterName, rosterPlayers] of Object.entries(dataToUse.rosters)) {
    // Check both hitters and pitchers arrays
    const players = rosterPlayers as { hitters?: string[]; pitchers?: string[] };
    const allPlayers = [
      ...(players.hitters || []),
      ...(players.pitchers || [])
    ];
    
    console.log(`[DEBUG] Checking roster "${rosterName}" with ${allPlayers.length} players`);
    if (allPlayers.length > 0) {
      console.log(`[DEBUG] Sample roster players:`, allPlayers.slice(0, 3));
    }
    
    // Check if this player is on this roster
    const isOnRoster = allPlayers.some(rosterPlayer => {
      const normalizedRosterPlayer = rosterPlayer.toLowerCase().trim();
      
      // Extract components from roster player: "LastName, I. (Year)" or "LastName, FirstName (Year)"
      const rosterMatch = normalizedRosterPlayer.match(/^([^,]+),\s*([^(]+)\s*\(([^)]+)\)/);
      if (!rosterMatch) {
        console.log(`[DEBUG] Regex failed for roster player: "${rosterPlayer}"`);
        return false;
      }
      
      const rosterLastName = rosterMatch[1].trim();
      const rosterFirstPart = rosterMatch[2].trim();
      const rosterYear = rosterMatch[3].trim();
      
      // Check if last names match
      if (rosterLastName !== lastName.toLowerCase()) return false;
      
      // Check if years match (handle both regular years and "NeL")
      const yearMatches = rosterYear === year.toLowerCase() || 
                         (rosterYear === 'nel' && year.toLowerCase() === 'nel');
      if (!yearMatches) return false;
      
      // Check first name/initial match
      // Roster could have "m." or "m" (initial) or "morgan" (full name)
      // Database has full first name like "Morgan"
      const rosterFirstInitial = rosterFirstPart.charAt(0);
      const rosterFirstCleaned = rosterFirstPart.replace('.', '').trim();
      const dbFirstInitial = firstInitial.toLowerCase();
      const dbFirstName = firstName.toLowerCase();
      
      console.log(`[DEBUG] Comparing: roster="${rosterFirstPart}" (initial="${rosterFirstInitial}", cleaned="${rosterFirstCleaned}") vs DB="${firstName}" (initial="${dbFirstInitial}")`);
      
      // Match if:
      // 1. First initials match (handles "M." or "M" in roster vs "Morgan" in DB)
      // 2. OR full first names match (handles "Morgan" in both)
      if (rosterFirstInitial === dbFirstInitial || rosterFirstCleaned === dbFirstName) {
        console.log(`[Roster Assignment] ✅ MATCH FOUND: "${playerName}" (${year}) → ${rosterName} (roster has "${rosterPlayer}")`);
        return true;
      }
      
      console.log(`[DEBUG] No match: "${rosterFirstInitial}" !== "${dbFirstInitial}" AND "${rosterFirstCleaned}" !== "${dbFirstName}"`);
      return false;
    });
    
    if (isOnRoster) {
      return rosterName;
    }
  }
  
  // Log unmatched players for debugging
  console.log(`[Roster Assignment] ✗ No match found for: "${playerName}" (${year})`);
  console.log(`  Database has: "${lastName}, ${firstName}"`);
  console.log(`  Looking for: "${lastName}, ${firstInitial}. (${year})" or "${lastName}, ${firstInitial} (${year})"`);
  
  // Player not found on any roster - they're a free agent
  return undefined;
}

/**
 * Batch assign rosters to multiple players
 */
export function assignRostersToPlayers<T extends { name: string; season: string; roster?: string }>(
  players: T[]
): T[] {
  return players.map(player => ({
    ...player,
    roster: assignRosterToPlayer(player.name, player.season) || ''
  }));
}
