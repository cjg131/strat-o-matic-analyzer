import { Trash2 } from 'lucide-react';
import type { HitterWithStats, PitcherWithStats } from '../types';
import { formatCurrency } from '../utils/calculations';

interface TeamRosterTableProps {
  hitters: HitterWithStats[];
  pitchers: PitcherWithStats[];
  onRemoveHitter: (id: string) => void;
  onRemovePitcher: (id: string) => void;
  onUpdateHitterNotes?: (id: string, notes: string) => void;
  onUpdatePitcherNotes?: (id: string, notes: string) => void;
}

export function TeamRosterTable({ hitters, pitchers, onRemoveHitter, onRemovePitcher, onUpdateHitterNotes, onUpdatePitcherNotes }: TeamRosterTableProps) {
  console.log('[TeamRosterTable] Received hitters:', hitters.length, hitters);
  console.log('[TeamRosterTable] Received pitchers:', pitchers.length, pitchers);
  
  const positionOrder = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
  
  const groupHittersByPosition = () => {
    const grouped: Record<string, HitterWithStats[]> = {};
    
    hitters.forEach(hitter => {
      // Find the player's best defensive position (lowest range + error rating)
      let bestPosition = '';
      let bestRating = 999;
      
      if (hitter.defensivePositions && Array.isArray(hitter.defensivePositions)) {
        for (const defPos of hitter.defensivePositions) {
          const rating = (defPos.range * 2) + defPos.error;
          if (rating < bestRating) {
            bestRating = rating;
            bestPosition = defPos.position.toUpperCase();
          }
        }
      }
      
      // If no defensive positions data, fall back to first position in positions string
      if (!bestPosition && hitter.positions) {
        const positions = hitter.positions.split(/[\/,]/).map(p => p.trim());
        if (positions.length > 0) {
          bestPosition = positions[0].split('-')[0].toUpperCase();
        }
      }
      
      // Default to DH if still no position found
      if (!bestPosition) {
        bestPosition = 'DH';
      }
      
      // Add player to their best position group
      if (!grouped[bestPosition]) {
        grouped[bestPosition] = [];
      }
      grouped[bestPosition].push(hitter);
    });
    
    return grouped;
  };

  const groupPitchersByRole = () => {
    const starters: PitcherWithStats[] = [];
    const relievers: PitcherWithStats[] = [];
    
    pitchers.forEach(pitcher => {
      const end = pitcher.endurance?.toUpperCase() || '';
      if (end.includes('S')) {
        starters.push(pitcher);
      } else {
        relievers.push(pitcher);
      }
    });
    
    return { starters, relievers };
  };

  const groupedHitters = groupHittersByPosition();
  const { starters, relievers } = groupPitchersByRole();

  return (
    <div className="space-y-6">
      {/* Hitters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Hitters ({hitters.length})
          </h2>
        </div>
        
        {hitters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No hitters added yet. Go to the Hitters page to add players.
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {positionOrder.map(position => {
              const posHitters = groupedHitters[position] || [];
              if (posHitters.length === 0) return null;
              
              return (
                <div key={position}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {position} ({posHitters.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Year</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Team</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Salary</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Bal</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">STL</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">RUN</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Range</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Arm</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Error</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">G</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">PA</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">AB</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">H</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BA</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">OBP</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">SLG</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">1B</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">2B</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">3B</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HR</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BB</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HBP</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">SB</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">CS</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/600</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/G</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/$</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Notes</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {posHitters.map(hitter => (
                          <tr key={hitter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{hitter.name}</td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.season}</td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.team || '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{formatCurrency(hitter.salary)}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.balance}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.stealRating || '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.runRating || '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {(() => {
                                if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                                return hitter.defensivePositions.map(dp => `${dp.position.toUpperCase()}: ${dp.range}`).join(' / ');
                              })()}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {(() => {
                                if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                                return hitter.defensivePositions.map(dp => dp.arm !== undefined ? (dp.arm >= 0 ? `+${dp.arm}` : `${dp.arm}`) : '-').join(' / ');
                              })()}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {(() => {
                                if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                                return hitter.defensivePositions.map(dp => `${dp.position.toUpperCase()}: ${dp.error}`).join(' / ');
                              })()}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {(() => {
                                if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                                const catcherPositions = hitter.defensivePositions.filter(dp => dp.position.toLowerCase() === 'c');
                                return catcherPositions.length > 0 ? catcherPositions.map(dp => dp.throwingRating || '-').join(' / ') : '-';
                              })()}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.games}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.plateAppearances}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.ab}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.h}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{hitter.ba ? hitter.ba.toFixed(3) : '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{hitter.obp ? hitter.obp.toFixed(3) : '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{hitter.slg ? hitter.slg.toFixed(3) : '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.singles}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.doubles}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.triples}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.homeRuns}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.walks}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.hitByPitch}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.stolenBases}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.caughtStealing}</td>
                            <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{hitter.fantasyPoints.toFixed(1)}</td>
                            <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{hitter.pointsPer600PA.toFixed(1)}</td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{hitter.pointsPerGame.toFixed(2)}</td>
                            <td className="px-3 py-2 text-center font-semibold text-green-600 dark:text-green-400">{hitter.pointsPerDollar.toFixed(2)}</td>
                            <td className="px-3 py-2">
                              {onUpdateHitterNotes ? (
                                <input
                                  type="text"
                                  value={hitter.notes || ''}
                                  onChange={(e) => onUpdateHitterNotes(hitter.id, e.target.value)}
                                  placeholder="Add notes..."
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              ) : (
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{hitter.notes || '-'}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => onRemoveHitter(hitter.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Remove from team"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pitchers Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Pitchers ({pitchers.length})
          </h2>
        </div>
        
        {pitchers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No pitchers added yet. Go to the Pitchers page to add players.
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Starters */}
            {starters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Starting Pitchers ({starters.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Year</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Team</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Salary</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">End</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">G</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">GS</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">IP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">K</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BB</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">H</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HR</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">ER</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Fld</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Hit</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Balk</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">WP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Hold</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Bunt</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/IP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/Start</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/$</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Notes</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {starters.map(pitcher => (
                        <tr key={pitcher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{pitcher.name}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.season}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.team || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{formatCurrency(pitcher.salary)}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.throwingArm}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.endurance}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.games}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.gamesStarted}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.inningsPitched}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.strikeouts}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.walks}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hitsAllowed}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.homeRunsAllowed}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.earnedRuns}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.fieldingRange ? `${pitcher.fieldingRange}(${pitcher.fieldingError >= 0 ? '+' : ''}${pitcher.fieldingError})` : '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hitting || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.balk || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.wildPitch || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hold || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.bunting || '-'}</td>
                          <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{pitcher.fantasyPoints.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{pitcher.pointsPerIP.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{pitcher.pointsPerStart.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-semibold text-green-600 dark:text-green-400">{pitcher.pointsPerDollar.toFixed(2)}</td>
                          <td className="px-3 py-2">
                            {onUpdatePitcherNotes ? (
                              <input
                                type="text"
                                value={pitcher.notes || ''}
                                onChange={(e) => onUpdatePitcherNotes(pitcher.id, e.target.value)}
                                placeholder="Add notes..."
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{pitcher.notes || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => onRemovePitcher(pitcher.id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Remove from team"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Relievers */}
            {relievers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Relief Pitchers ({relievers.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Year</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Team</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Salary</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">End</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">G</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">GS</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">IP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">K</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">BB</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">H</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">HR</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">ER</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Fld</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Hit</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Balk</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">WP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Hold</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Bunt</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/IP</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">FP/$</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Notes</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {relievers.map(pitcher => (
                        <tr key={pitcher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{pitcher.name}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.season}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.team || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{formatCurrency(pitcher.salary)}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.throwingArm}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.endurance}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.games}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.gamesStarted}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.inningsPitched}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.strikeouts}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.walks}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hitsAllowed}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.homeRunsAllowed}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.earnedRuns}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.fieldingRange ? `${pitcher.fieldingRange}(${pitcher.fieldingError >= 0 ? '+' : ''}${pitcher.fieldingError})` : '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hitting || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.balk || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.wildPitch || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hold || '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.bunting || '-'}</td>
                          <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{pitcher.fantasyPoints.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-semibold text-primary-600 dark:text-primary-400">{pitcher.pointsPerIP.toFixed(1)}</td>
                          <td className="px-3 py-2 text-center font-semibold text-green-600 dark:text-green-400">{pitcher.pointsPerDollar.toFixed(2)}</td>
                          <td className="px-3 py-2">
                            {onUpdatePitcherNotes ? (
                              <input
                                type="text"
                                value={pitcher.notes || ''}
                                onChange={(e) => onUpdatePitcherNotes(pitcher.id, e.target.value)}
                                placeholder="Add notes..."
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{pitcher.notes || '-'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => onRemovePitcher(pitcher.id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Remove from team"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
