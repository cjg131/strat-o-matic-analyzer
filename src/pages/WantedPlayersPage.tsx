import { useMemo, useState } from 'react';
import { useWantedPlayers } from '../hooks/useWantedPlayers';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { HittersTable } from '../components/HittersTable';
import { PitchersTable } from '../components/PitchersTable';
import { calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import type { HitterWithStats, PitcherWithStats, HitterScoringWeights, PitcherScoringWeights } from '../types';

const HITTER_PRESETS: Record<string, { name: string; weights: HitterScoringWeights }> = {
  balanced: {
    name: 'Balanced',
    weights: { single: 2, double: 3, triple: 5, homeRun: 6, walk: 1, hitByPitch: 1, stolenBase: 2, caughtStealing: -1, stlRating: 3, runRating: 1.5, outPenalty: -0.3, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  power: {
    name: 'Power Hitting',
    weights: { single: 1, double: 4, triple: 7, homeRun: 10, walk: 0.5, hitByPitch: 0.5, stolenBase: 0.5, caughtStealing: -0.5, stlRating: 1, runRating: 0.5, outPenalty: -0.2, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  speed: {
    name: 'Speed & Base Running',
    weights: { single: 3, double: 4, triple: 6, homeRun: 5, walk: 1.5, hitByPitch: 1.5, stolenBase: 4, caughtStealing: -3, stlRating: 6, runRating: 3, outPenalty: -0.3, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  obp: {
    name: 'On-Base (OBP)',
    weights: { single: 3, double: 4, triple: 6, homeRun: 7, walk: 2.5, hitByPitch: 2.5, stolenBase: 1, caughtStealing: -1, stlRating: 2, runRating: 1, outPenalty: -0.5, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  contact: {
    name: 'Contact Hitting',
    weights: { single: 3, double: 4, triple: 5, homeRun: 6, walk: 1.5, hitByPitch: 1.5, stolenBase: 1.5, caughtStealing: -1, stlRating: 2, runRating: 1, outPenalty: -0.6, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  defense: {
    name: 'Defense First',
    weights: { single: 2, double: 3, triple: 5, homeRun: 6, walk: 1, hitByPitch: 1, stolenBase: 2, caughtStealing: -1, stlRating: 3, runRating: 1.5, outPenalty: -0.3, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 3, fieldingErrorPenalty: -1 }
  },
  defenseSpeed: {
    name: 'Defense & Speed',
    weights: { single: 2.5, double: 3.5, triple: 5, homeRun: 5, walk: 1.5, hitByPitch: 1.5, stolenBase: 3, caughtStealing: -2, stlRating: 5, runRating: 2.5, outPenalty: -0.4, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 2, fieldingErrorPenalty: -0.75 }
  }
};

const PITCHER_PRESETS: Record<string, { name: string; weights: PitcherScoringWeights }> = {
  balanced: {
    name: 'Balanced',
    weights: { strikeout: 1, walkAllowed: -1, hitAllowed: -1, homeRunAllowed: -3, earnedRun: -2 }
  },
  strikeout: {
    name: 'Strikeout Pitcher',
    weights: { strikeout: 2, walkAllowed: -0.5, hitAllowed: -0.8, homeRunAllowed: -2, earnedRun: -1.5 }
  },
  control: {
    name: 'Control & Command',
    weights: { strikeout: 0.5, walkAllowed: -2, hitAllowed: -1.5, homeRunAllowed: -3, earnedRun: -2.5 }
  },
  groundball: {
    name: 'Ground Ball Pitcher',
    weights: { strikeout: 0.5, walkAllowed: -1, hitAllowed: -0.8, homeRunAllowed: -4, earnedRun: -2 }
  }
};

export function WantedPlayersPage() {
  const { wantedPlayers, loading, removePlayer } = useWantedPlayers();
  const { hitters: allHitters } = useHitters();
  const { pitchers: allPitchers } = usePitchers();
  const { weights, updateWeights } = useScoringWeights();
  const [useNormalized, setUseNormalized] = useState(false);
  const [useNormalizedPitchers, setUseNormalizedPitchers] = useState(false);
  const [selectedHitterPreset, setSelectedHitterPreset] = useState('balanced');
  const [selectedPitcherPreset, setSelectedPitcherPreset] = useState('balanced');

  // Get wanted player IDs
  const wantedHitterIds = useMemo(() => 
    wantedPlayers.filter(p => p.playerType === 'hitter').map(p => p.playerId),
    [wantedPlayers]
  );
  
  const wantedPitcherIds = useMemo(() => 
    wantedPlayers.filter(p => p.playerType === 'pitcher').map(p => p.playerId),
    [wantedPlayers]
  );

  // Filter and calculate stats for wanted players
  const wantedHittersWithStats: HitterWithStats[] = useMemo(() => {
    return allHitters
      .filter(h => wantedHitterIds.includes(h.id))
      .map(h => {
        const stats = calculateHitterStats(h, weights.hitter);
        
        if (useNormalized) {
          // Recalculate FP/G and FP/$ based on FP/600PA instead of total FP
          const normalizedFP = stats.pointsPer600PA;
          return {
            ...stats,
            pointsPerGame: h.games > 0 ? normalizedFP / h.games : 0,
            pointsPerDollar: h.salary > 0 ? (normalizedFP / (h.salary / 1000)) * 100 : 0,
          };
        }
        
        return stats;
      });
  }, [allHitters, wantedHitterIds, weights.hitter, useNormalized]);

  const wantedPitchersWithStats: PitcherWithStats[] = useMemo(() => {
    return allPitchers
      .filter(p => wantedPitcherIds.includes(p.id))
      .map(p => {
        const stats = calculatePitcherStats(p, weights.pitcher);
        
        if (useNormalizedPitchers) {
          // Recalculate FP/Start and FP/$ based on FP/IP instead of total FP
          const normalizedFP = stats.pointsPerIP;
          return {
            ...stats,
            pointsPerStart: p.gamesStarted > 0 ? normalizedFP / p.gamesStarted : 0,
            pointsPerDollar: p.salary > 0 ? (normalizedFP / (p.salary / 1000)) * 100 : 0,
          };
        }
        
        return stats;
      });
  }, [allPitchers, wantedPitcherIds, weights.pitcher, useNormalizedPitchers]);

  const handleRemoveHitter = (id: string) => {
    const wantedPlayer = wantedPlayers.find(p => p.playerId === id);
    if (wantedPlayer && confirm(`Remove ${wantedPlayer.playerName} from wanted list?`)) {
      removePlayer(wantedPlayer.id);
    }
  };

  const handleRemovePitcher = (id: string) => {
    const wantedPlayer = wantedPlayers.find(p => p.playerId === id);
    if (wantedPlayer && confirm(`Remove ${wantedPlayer.playerName} from wanted list?`)) {
      removePlayer(wantedPlayer.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600 dark:text-gray-300">Loading wanted players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Wanted Players
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track players you're interested in acquiring - Click star icon again to remove
        </p>
      </div>

      {wantedPlayers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No wanted players yet. Add players from the Hitters or Pitchers pages using the star icon.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hitters Section */}
          {wantedHittersWithStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-700 px-6 py-3">
                <h2 className="text-xl font-bold text-white">Hitters ({wantedHittersWithStats.length})</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Hitter Scoring Weights</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Preset Strategy</label>
                    <select
                      value={selectedHitterPreset}
                      onChange={(e) => {
                        setSelectedHitterPreset(e.target.value);
                        const preset = HITTER_PRESETS[e.target.value];
                        if (preset) {
                          updateWeights({ ...weights, hitter: preset.weights });
                        }
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(HITTER_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Single (1B)</label>
                    <input type="number" step="0.1" value={weights.hitter.single}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, single: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Double (2B)</label>
                    <input type="number" step="0.1" value={weights.hitter.double}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, double: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Triple (3B)</label>
                    <input type="number" step="0.1" value={weights.hitter.triple}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, triple: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Home Run (HR)</label>
                    <input type="number" step="0.1" value={weights.hitter.homeRun}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, homeRun: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Walk (BB)</label>
                    <input type="number" step="0.1" value={weights.hitter.walk}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, walk: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Hit By Pitch (HBP)</label>
                    <input type="number" step="0.1" value={weights.hitter.hitByPitch}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, hitByPitch: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Stolen Base (SB)</label>
                    <input type="number" step="0.1" value={weights.hitter.stolenBase}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, stolenBase: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Caught Stealing (CS)</label>
                    <input type="number" step="0.1" value={weights.hitter.caughtStealing}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, caughtStealing: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">STL Rating (per level)</label>
                    <input type="number" step="0.5" value={weights.hitter.stlRating}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, stlRating: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">RUN Rating (per level)</label>
                    <input type="number" step="0.5" value={weights.hitter.runRating}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, runRating: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Out Penalty (per out)</label>
                    <input type="number" step="0.1" value={weights.hitter.outPenalty}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, outPenalty: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Balance vs RHP (per level)</label>
                    <input type="number" step="0.5" value={weights.hitter.balanceVsRHP}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, balanceVsRHP: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Balance vs LHP (per level)</label>
                    <input type="number" step="0.5" value={weights.hitter.balanceVsLHP}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, balanceVsLHP: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Fielding Range Bonus (per level)</label>
                    <input type="number" step="0.5" value={weights.hitter.fieldingRangeBonus}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, fieldingRangeBonus: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Fielding Error Penalty (per error)</label>
                    <input type="number" step="0.5" value={weights.hitter.fieldingErrorPenalty}
                      onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, fieldingErrorPenalty: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Defensive Scoring:</strong> Range 1 (best) gets 5× bonus, Range 5 (worst) gets 1× bonus. Errors are negative (good) or positive (bad). Example: Range 2(-6) with Range Bonus=2 and Error Penalty=-0.5 gives (6-2)×2 + (-6)×(-0.5) = 8 + 3 = 11 defensive points.
                  </p>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useNormalized}
                      onChange={(e) => setUseNormalized(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Calculate FP/G and FP/$ from FP/600PA (normalized)
                    </span>
                  </label>
                </div>
                <HittersTable
                  hitters={wantedHittersWithStats}
                  onEdit={() => {}}
                  onDelete={handleRemoveHitter}
                />
              </div>
            </div>
          )}

          {/* Pitchers Section */}
          {wantedPitchersWithStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
                <h2 className="text-xl font-bold text-white">Pitchers ({wantedPitchersWithStats.length})</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pitcher Scoring Weights</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Preset Strategy</label>
                    <select
                      value={selectedPitcherPreset}
                      onChange={(e) => {
                        setSelectedPitcherPreset(e.target.value);
                        const preset = PITCHER_PRESETS[e.target.value];
                        if (preset) {
                          updateWeights({ ...weights, pitcher: preset.weights });
                        }
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(PITCHER_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Strikeout (K)</label>
                    <input type="number" step="0.1" value={weights.pitcher.strikeout}
                      onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, strikeout: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Walk Allowed (BB)</label>
                    <input type="number" step="0.1" value={weights.pitcher.walkAllowed}
                      onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, walkAllowed: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Hit Allowed (H)</label>
                    <input type="number" step="0.1" value={weights.pitcher.hitAllowed}
                      onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, hitAllowed: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Home Run Allowed (HR)</label>
                    <input type="number" step="0.1" value={weights.pitcher.homeRunAllowed}
                      onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, homeRunAllowed: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Earned Run (ER)</label>
                    <input type="number" step="0.1" value={weights.pitcher.earnedRun}
                      onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, earnedRun: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useNormalizedPitchers}
                      onChange={(e) => setUseNormalizedPitchers(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Calculate FP/Start and FP/$ from FP/IP (normalized)
                    </span>
                  </label>
                </div>
                <PitchersTable
                  pitchers={wantedPitchersWithStats}
                  onEdit={() => {}}
                  onDelete={handleRemovePitcher}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
