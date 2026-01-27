import rosterData from '../../roster-assignments.json';

/**
 * Assigns roster names to players based on the roster-assignments.json file
 * Matches players by name and year in format "LastName, Initial (Year)"
 */
export function assignRosterToPlayer(playerName: string, year: string): string | undefined {
  // Format the player identifier to match roster format: "LastName, I. (Year)"
  const playerIdentifier = `${playerName} (${year})`;
  
  // Search through all rosters
  for (const [rosterName, rosterPlayers] of Object.entries(rosterData.rosters)) {
    // Check both hitters and pitchers arrays
    const allPlayers = [
      ...(rosterPlayers.hitters || []),
      ...(rosterPlayers.pitchers || [])
    ];
    
    // Check if this player is on this roster
    // Use flexible matching to handle slight variations in formatting
    const isOnRoster = allPlayers.some(rosterPlayer => {
      // Normalize both strings for comparison
      const normalizedRosterPlayer = rosterPlayer.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedPlayerIdentifier = playerIdentifier.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Check if the roster player string contains the player identifier
      // This handles cases where the roster might have "LastName, F. (1999)" and we're looking for "LastName, F (1999)"
      return normalizedRosterPlayer.includes(normalizedPlayerIdentifier) || 
             normalizedPlayerIdentifier.includes(normalizedRosterPlayer);
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
