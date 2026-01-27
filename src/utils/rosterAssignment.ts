import rosterData from '../../roster-assignments.json';

/**
 * Assigns roster names to players based on the roster-assignments.json file
 * Matches players by name and year in format "LastName, Initial (Year)"
 */
export function assignRosterToPlayer(playerName: string, year: string): string | undefined {
  // Parse the player name to extract last name and first initial
  // Handle formats like "Ruth, Babe" or "Ruth, B." or "Ruth, B"
  const nameParts = playerName.split(',').map(p => p.trim());
  if (nameParts.length < 2) {
    return undefined; // Can't match without proper format
  }
  
  const lastName = nameParts[0].trim();
  const firstName = nameParts[1].trim();
  const firstInitial = firstName.charAt(0).toUpperCase();
  
  // Create matching patterns
  // Pattern 1: "LastName, I. (Year)" - roster format with period
  // Pattern 2: "LastName, I (Year)" - roster format without period
  const pattern1 = `${lastName}, ${firstInitial}. (${year})`.toLowerCase();
  const pattern2 = `${lastName}, ${firstInitial} (${year})`.toLowerCase();
  
  // Search through all rosters
  for (const [rosterName, rosterPlayers] of Object.entries(rosterData.rosters)) {
    // Check both hitters and pitchers arrays
    const allPlayers = [
      ...(rosterPlayers.hitters || []),
      ...(rosterPlayers.pitchers || [])
    ];
    
    // Check if this player is on this roster
    const isOnRoster = allPlayers.some(rosterPlayer => {
      const normalizedRosterPlayer = rosterPlayer.toLowerCase().trim();
      
      // Try exact match with both patterns
      if (normalizedRosterPlayer === pattern1 || normalizedRosterPlayer === pattern2) {
        return true;
      }
      
      // Also try matching just the name part before the year
      const rosterNamePart = normalizedRosterPlayer.split('(')[0].trim();
      const pattern1NamePart = pattern1.split('(')[0].trim();
      const pattern2NamePart = pattern2.split('(')[0].trim();
      
      if (rosterNamePart === pattern1NamePart || rosterNamePart === pattern2NamePart) {
        // If name matches, also check year
        const yearMatch = normalizedRosterPlayer.match(/\((\d{4})\)/);
        if (yearMatch && yearMatch[1] === year) {
          return true;
        }
      }
      
      return false;
    });
    
    if (isOnRoster) {
      return rosterName;
    }
  }
  
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
