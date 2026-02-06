import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useSeasonTeam } from '../hooks/useSeasonTeam';
import { calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import type { HitterWithStats, PitcherWithStats } from '../types';

export function LeagueTeamOverviewPage() {
  const { selectedTeamName } = useSeasonTeam();
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  const { weights } = useScoringWeights();

  const teamHitters = hitters.filter(h => h.roster === selectedTeamName);
  const teamPitchers = pitchers.filter(p => p.roster === selectedTeamName);

  const hittersWithStats: HitterWithStats[] = teamHitters.map(h => calculateHitterStats(h, weights.hitter));
  const pitchersWithStats: PitcherWithStats[] = teamPitchers.map(p => calculatePitcherStats(p, weights.pitcher));

  const totalFP = [
    ...hittersWithStats.map(h => h.fantasyPoints),
    ...pitchersWithStats.map(p => p.fantasyPoints),
  ].reduce((sum, fp) => sum + fp, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{teamHitters.length + teamPitchers.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Players</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{teamHitters.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hitters</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{teamPitchers.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pitchers</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalFP.toFixed(0)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total FP</p>
        </div>
      </div>

      {hittersWithStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Hitters (by FP)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Pos</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BA</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HR</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                </tr>
              </thead>
              <tbody>
                {[...hittersWithStats].sort((a, b) => b.fantasyPoints - a.fantasyPoints).slice(0, 10).map((h) => (
                  <tr key={h.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{h.name}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.positions?.split(',')[0]}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.ba?.toFixed(3) || '-'}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.homeRuns}</td>
                    <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{h.fantasyPoints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pitchersWithStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Pitchers (by FP)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">End</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">IP</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">K</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                </tr>
              </thead>
              <tbody>
                {[...pitchersWithStats].sort((a, b) => b.fantasyPoints - a.fantasyPoints).slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.throwingArm}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.endurance}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.inningsPitched}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.strikeouts}</td>
                    <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{p.fantasyPoints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
