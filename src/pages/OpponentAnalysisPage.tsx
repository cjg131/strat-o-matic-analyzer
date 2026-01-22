import { useMemo } from 'react';
import { useHitters } from '../hooks/useHitters';
import rosterData from '../../roster-assignments.json';

export function OpponentAnalysisPage() {
  const { hitters } = useHitters();

  const opponentAnalysis = useMemo(() => {
    const opponents = ['Washington Capitals II', 'Forest City Grays', 'Northfield Retirees'];
    
    return opponents.map(teamName => {
      const teamRoster = rosterData.rosters[teamName as keyof typeof rosterData.rosters];
      if (!teamRoster) return null;

      // Get all hitters for this team from Firestore
      const teamHitters = hitters.filter(h => {
        if (!h.roster) return false;
        return h.roster === teamName;
      });

      // Calculate balance distribution
      const balanceCount = {
        L: 0,  // Left-handed (better vs RHP)
        R: 0,  // Right-handed (better vs LHP)
        S: 0,  // Switch hitter
        E: 0,  // Even (no platoon split)
      };

      teamHitters.forEach(h => {
        const balance = h.balance?.toUpperCase() || 'E';
        if (balance.includes('L')) balanceCount.L++;
        else if (balance.includes('R')) balanceCount.R++;
        else if (balance.includes('S')) balanceCount.S++;
        else balanceCount.E++;
      });

      const total = teamHitters.length;
      const lhbCount = balanceCount.L + balanceCount.S; // LHB or Switch
      const rhbCount = balanceCount.R + balanceCount.S; // RHB or Switch

      return {
        teamName,
        totalHitters: total,
        balanceCount,
        lhbCount,
        rhbCount,
        hitters: teamHitters,
        // Strategic insights
        vulnerableToRHP: balanceCount.L > balanceCount.R, // More lefties = vulnerable to RHP
        vulnerableToLHP: balanceCount.R > balanceCount.L, // More righties = vulnerable to LHP
      };
    }).filter(Boolean);
  }, [hitters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Opponent Roster Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Week 1 opponents - analyzing hitter balance to optimize pitcher matchups
        </p>
      </div>

      {opponentAnalysis.map((analysis) => {
        if (!analysis) return null;
        
        return (
          <div key={analysis.teamName} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {analysis.teamName}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Hitters</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysis.totalHitters}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">L Balance</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysis.balanceCount.L}
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">R Balance</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysis.balanceCount.R}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">S/E Balance</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysis.balanceCount.S + analysis.balanceCount.E}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Strategic Analysis:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">LHB Count:</span> {analysis.lhbCount} 
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    (Better vs RHP)
                  </span>
                </div>
                <div>
                  <span className="font-medium">RHB Count:</span> {analysis.rhbCount}
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    (Better vs LHP)
                  </span>
                </div>
                {analysis.vulnerableToRHP && (
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    ✓ Vulnerable to RHP - Use Clarkson, Fraser, or Johnson
                  </div>
                )}
                {analysis.vulnerableToLHP && (
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    ✓ Vulnerable to LHP - Use Cooper
                  </div>
                )}
                {!analysis.vulnerableToRHP && !analysis.vulnerableToLHP && (
                  <div className="text-gray-600 dark:text-gray-400">
                    → Balanced roster - No clear platoon advantage
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-center">Balance</th>
                    <th className="px-3 py-2 text-left">Positions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analysis.hitters.map((hitter) => (
                    <tr key={hitter.id}>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{hitter.name}</td>
                      <td className="px-3 py-2 text-center font-semibold">
                        <span className={
                          hitter.balance?.includes('L') ? 'text-green-600 dark:text-green-400' :
                          hitter.balance?.includes('R') ? 'text-yellow-600 dark:text-yellow-400' :
                          hitter.balance?.includes('S') ? 'text-purple-600 dark:text-purple-400' :
                          'text-gray-600 dark:text-gray-400'
                        }>
                          {hitter.balance || 'E'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.positions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
          Your Pitching Staff:
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <div><strong>Cooper, Wilbur (L, E):</strong> S8, 1.87 ERA - Even splits, elite vs everyone</div>
          <div><strong>Clarkson, John (R, 1R):</strong> S9*, 2.76 ERA - Slightly better vs RHB</div>
          <div><strong>Fraser, Chick (R, E):</strong> S9*, 3.81 ERA - Even splits</div>
          <div><strong>Johnson, School Boy (R, 1R):</strong> S8*, 2.56 ERA - Slightly better vs RHB</div>
        </div>
      </div>
    </div>
  );
}
