import { useMemo } from 'react';
import { useWantedPlayers } from '../hooks/useWantedPlayers';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { HittersTable } from '../components/HittersTable';
import { PitchersTable } from '../components/PitchersTable';
import { calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import type { HitterWithStats, PitcherWithStats } from '../types';

export function WantedPlayersPage() {
  const { wantedPlayers, loading, removePlayer } = useWantedPlayers();
  const { hitters: allHitters } = useHitters();
  const { pitchers: allPitchers } = usePitchers();
  const { weights } = useScoringWeights();

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
      .map(h => calculateHitterStats(h, weights.hitter));
  }, [allHitters, wantedHitterIds, weights.hitter]);

  const wantedPitchersWithStats: PitcherWithStats[] = useMemo(() => {
    return allPitchers
      .filter(p => wantedPitcherIds.includes(p.id))
      .map(p => calculatePitcherStats(p, weights.pitcher));
  }, [allPitchers, wantedPitcherIds, weights.pitcher]);

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
