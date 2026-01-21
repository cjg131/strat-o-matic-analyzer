import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import type { HitterWithStats, PitcherWithStats } from '../types';

interface TeamData {
  name: string;
  pitchers: PitcherWithStats[];
  hitters: HitterWithStats[];
}

export function TeamRostersPage() {
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  const { weights } = useScoringWeights();

  const hittersWithStats = hitters.map((h) => calculateHitterStats(h, weights.hitter));
  const pitchersWithStats = pitchers.map((p) => calculatePitcherStats(p, weights.pitcher));

  // Group players by team
  const teams: Record<string, TeamData> = {};
  
  hittersWithStats.forEach((hitter) => {
    const teamName = hitter.team || 'Unassigned';
    if (!teams[teamName]) {
      teams[teamName] = { name: teamName, pitchers: [], hitters: [] };
    }
    teams[teamName].hitters.push(hitter);
  });

  pitchersWithStats.forEach((pitcher) => {
    const teamName = pitcher.team || 'Unassigned';
    if (!teams[teamName]) {
      teams[teamName] = { name: teamName, pitchers: [], hitters: [] };
    }
    teams[teamName].pitchers.push(pitcher);
  });

  const teamList = Object.values(teams).sort((a, b) => a.name.localeCompare(b.name));

  const calculateTeamTotals = (team: TeamData) => {
    const pitchersTotal = team.pitchers.reduce((sum, p) => sum + p.salary, 0);
    const hittersTotal = team.hitters.reduce((sum, h) => sum + h.salary, 0);
    const rosterTotal = pitchersTotal + hittersTotal;
    const cash = 80000000 - rosterTotal;
    return { pitchersTotal, hittersTotal, rosterTotal, cash };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Team Rosters
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View all team rosters organized by division
        </p>
      </div>

      {teamList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No teams found. Import players with team assignments to see rosters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {teamList.map((team) => {
            const totals = calculateTeamTotals(team);
            
            return (
              <div key={team.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-primary-600 dark:bg-primary-700 px-4 py-3">
                  <h2 className="text-lg font-bold text-white">{team.name}</h2>
                  <p className="text-sm text-primary-100">
                    {team.pitchers.length}P / {team.hitters.length}H
                  </p>
                </div>

                {/* Pitchers Section */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    Pitchers
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-1 px-1">Name</th>
                          <th className="text-center py-1 px-1">T</th>
                          <th className="text-center py-1 px-1">P</th>
                          <th className="text-right py-1 px-1">$M</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-900 dark:text-gray-100">
                        {team.pitchers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-2 text-gray-500 dark:text-gray-400">
                              No pitchers
                            </td>
                          </tr>
                        ) : (
                          team.pitchers.map((pitcher) => (
                            <tr key={pitcher.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-1 px-1 truncate max-w-[120px]" title={pitcher.name}>
                                {pitcher.name}
                              </td>
                              <td className="text-center py-1 px-1">{pitcher.throwingArm}</td>
                              <td className="text-center py-1 px-1">{pitcher.endurance}</td>
                              <td className="text-right py-1 px-1">
                                {(pitcher.salary / 1000000).toFixed(2)}M
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className="font-semibold bg-green-50 dark:bg-green-900/20">
                        <tr>
                          <td colSpan={3} className="py-1 px-1 text-left">Pitchers Total</td>
                          <td className="text-right py-1 px-1">
                            {(totals.pitchersTotal / 1000000).toFixed(2)}M
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Hitters Section */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    Hitters
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-1 px-1">Name</th>
                          <th className="text-center py-1 px-1">B</th>
                          <th className="text-center py-1 px-1">P</th>
                          <th className="text-right py-1 px-1">$M</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-900 dark:text-gray-100">
                        {team.hitters.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-2 text-gray-500 dark:text-gray-400">
                              No hitters
                            </td>
                          </tr>
                        ) : (
                          team.hitters.map((hitter) => (
                            <tr key={hitter.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-1 px-1 truncate max-w-[120px]" title={hitter.name}>
                                {hitter.name}
                              </td>
                              <td className="text-center py-1 px-1">
                                {hitter.balance === 'E' ? 'E' : hitter.balance?.match(/[RL]/)?.[0] || '-'}
                              </td>
                              <td className="text-center py-1 px-1">{hitter.positions}</td>
                              <td className="text-right py-1 px-1">
                                {(hitter.salary / 1000000).toFixed(2)}M
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className="font-semibold bg-blue-50 dark:bg-blue-900/20">
                        <tr>
                          <td colSpan={3} className="py-1 px-1 text-left">Hitters Total</td>
                          <td className="text-right py-1 px-1">
                            {(totals.hittersTotal / 1000000).toFixed(2)}M
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Roster Total</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(totals.rosterTotal / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Cash</span>
                    <span className={totals.cash < 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                      {(totals.cash / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-300 dark:border-gray-700">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Total Value</span>
                    <span className="font-bold text-gray-900 dark:text-white">80.00M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
