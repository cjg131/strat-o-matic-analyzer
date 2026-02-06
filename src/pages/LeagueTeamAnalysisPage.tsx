import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import type { HitterWithStats, PitcherWithStats } from '../types';

type AnalysisTab = 'hitters' | 'pitchers' | 'overview';

export function LeagueTeamAnalysisPage() {
  const { teamName: encodedTeamName } = useParams<{ teamName: string }>();
  const teamName = decodeURIComponent(encodedTeamName || '');
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  const { weights } = useScoringWeights();
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  const teamHitters = hitters.filter(h => h.roster === teamName);
  const teamPitchers = pitchers.filter(p => p.roster === teamName);

  const hittersWithStats: HitterWithStats[] = teamHitters.map(h => calculateHitterStats(h, weights.hitter));
  const pitchersWithStats: PitcherWithStats[] = teamPitchers.map(p => calculatePitcherStats(p, weights.pitcher));

  const totalFP = [
    ...hittersWithStats.map(h => h.fantasyPoints),
    ...pitchersWithStats.map(p => p.fantasyPoints),
  ].reduce((sum, fp) => sum + fp, 0);

  const tabs: { key: AnalysisTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'hitters', label: `Hitters (${teamHitters.length})` },
    { key: 'pitchers', label: `Pitchers (${teamPitchers.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/season/manage/league-teams"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          League Teams
        </Link>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{teamName}</h1>
      </div>

      {/* Tab navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
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

          {/* Top hitters */}
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

          {/* Top pitchers */}
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
      )}

      {activeTab === 'hitters' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hitters — {teamName}</h2>
          {hittersWithStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No hitters found for this team.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Year</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Pos</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Sal</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Bal</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BA</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">OBP</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">SLG</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HR</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">STL</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                  </tr>
                </thead>
                <tbody>
                  {[...hittersWithStats].sort((a, b) => b.fantasyPoints - a.fantasyPoints).map((h) => (
                    <tr key={h.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-white font-medium whitespace-nowrap">{h.name}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.season}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.positions?.split(',')[0]}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">${(h.salary / 1000).toFixed(0)}K</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.balance}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.ba?.toFixed(3) || '-'}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.obp?.toFixed(3) || '-'}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.slg?.toFixed(3) || '-'}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.homeRuns}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{h.stealRating || '-'}</td>
                      <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{h.fantasyPoints.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pitchers' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pitchers — {teamName}</h2>
          {pitchersWithStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No pitchers found for this team.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Year</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Sal</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">End</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">IP</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">K</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BB</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">H</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HR</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                  </tr>
                </thead>
                <tbody>
                  {[...pitchersWithStats].sort((a, b) => b.fantasyPoints - a.fantasyPoints).map((p) => (
                    <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-white font-medium whitespace-nowrap">{p.name}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.season}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">${(p.salary / 1000).toFixed(0)}K</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.throwingArm}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.endurance}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.inningsPitched}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.strikeouts}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.walks}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.hitsAllowed}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{p.homeRunsAllowed}</td>
                      <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{p.fantasyPoints.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
