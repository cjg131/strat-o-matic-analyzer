import rosterData from '../../roster-assignments.json';

/**
 * Diagnostic tool to compare roster file against database players
 */
export function diagnoseRosterMismatches(
  databasePlayers: Array<{ name: string; season: string; roster?: string }>
) {
  console.log('\n========== ROSTER DIAGNOSTIC ==========\n');
  
  // Get all players from roster file
  const rosterPlayers: Array<{ name: string; team: string }> = [];
  for (const [teamName, teamData] of Object.entries(rosterData.rosters)) {
    const allPlayers = [
      ...(teamData.hitters || []),
      ...(teamData.pitchers || [])
    ];
    allPlayers.forEach(playerStr => {
      rosterPlayers.push({ name: playerStr, team: teamName });
    });
  }
  
  console.log(`Total players in roster file: ${rosterPlayers.length}`);
  console.log(`Total players in database: ${databasePlayers.length}`);
  
  // Convert database players to comparable format
  const dbPlayerKeys = new Set(
    databasePlayers.map(p => {
      const nameParts = p.name.split(',').map(s => s.trim());
      if (nameParts.length < 2) return '';
      const lastName = nameParts[0];
      const firstInitial = nameParts[1].charAt(0).toUpperCase();
      return `${lastName}, ${firstInitial}. (${p.season})`.toLowerCase();
    })
  );
  
  // Find roster players not in database
  const missingFromDb: string[] = [];
  rosterPlayers.forEach(rp => {
    const normalized = rp.name.toLowerCase();
    if (!dbPlayerKeys.has(normalized)) {
      missingFromDb.push(`${rp.name} → ${rp.team}`);
    }
  });
  
  console.log(`\n❌ Players in ROSTER FILE but NOT in DATABASE (${missingFromDb.length}):`);
  if (missingFromDb.length > 0) {
    missingFromDb.slice(0, 20).forEach(p => console.log(`  - ${p}`));
    if (missingFromDb.length > 20) {
      console.log(`  ... and ${missingFromDb.length - 20} more`);
    }
  }
  
  // Find database players that should be rostered but aren't matching
  const dbWithoutRoster = databasePlayers.filter(p => !p.roster || p.roster === '');
  console.log(`\n📋 Players in DATABASE without roster assignment: ${dbWithoutRoster.length}`);
  console.log('Sample (first 20):');
  dbWithoutRoster.slice(0, 20).forEach(p => {
    console.log(`  - ${p.name} (${p.season})`);
  });
  
  console.log('\n========== END DIAGNOSTIC ==========\n');
  
  return {
    rosterFileCount: rosterPlayers.length,
    databaseCount: databasePlayers.length,
    missingFromDatabase: missingFromDb.length,
    unassignedInDatabase: dbWithoutRoster.length
  };
}
