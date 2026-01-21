import { useState } from 'react';
import { useHitters } from '../hooks/useHitters';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { calculateHitterStats } from '../utils/calculations';
import type { HitterWithStats } from '../types';

interface LineupSlot {
  position: number;
  playerId: string | null;
  playerName: string;
  pos: string;
  def: string;
  bal: string;
  simBA: number;
  simOBP: number;
  simSLG: number;
  realBA: number;
  realOBP: number;
  realSLG: number;
  backup1: string;
  backup2: string;
  platoonPH: string;
}

export function LineupOptimizerPage() {
  const { hitters } = useHitters();
  const { weights } = useScoringWeights();

  const hittersWithStats: HitterWithStats[] = hitters
    .filter(h => h.roster)
    .map(h => calculateHitterStats(h, weights.hitter));

  const emptySlot = (position: number): LineupSlot => ({
    position,
    playerId: null,
    playerName: 'empty',
    pos: '',
    def: '',
    bal: '',
    simBA: 0,
    simOBP: 0,
    simSLG: 0,
    realBA: 0,
    realOBP: 0,
    realSLG: 0,
    backup1: '',
    backup2: '',
    platoonPH: '',
  });

  // Initial lineup vs LHSP (favor right-handed batters)
  const [vsLHSPLineup] = useState<LineupSlot[]>([
    { position: 1, playerId: '1', playerName: 'Rodriguez, I. (1999)', pos: 'C', def: '1(-5)e1', bal: '1', simBA: 0.332, simOBP: 0.356, simSLG: 0.558, realBA: 0.332, realOBP: 0.356, realSLG: 0.558, backup1: '', backup2: '', platoonPH: '' },
    { position: 2, playerId: '2', playerName: 'Chance, F. (1906)', pos: '1B', def: '1e8', bal: '1', simBA: 0.319, simOBP: 0.419, simSLG: 0.430, realBA: 0.319, realOBP: 0.419, realSLG: 0.430, backup1: '', backup2: '', platoonPH: '' },
    { position: 3, playerId: '3', playerName: 'Boone, B. (2003)', pos: '2B', def: '1e8', bal: '1', simBA: 0.294, simOBP: 0.366, simSLG: 0.535, realBA: 0.294, realOBP: 0.366, realSLG: 0.535, backup1: '', backup2: '', platoonPH: '' },
    { position: 4, playerId: '4', playerName: 'Lansford, C. (1979)', pos: '3B', def: '2e8', bal: '1', simBA: 0.287, simOBP: 0.329, simSLG: 0.436, realBA: 0.287, realOBP: 0.329, realSLG: 0.436, backup1: '', backup2: '', platoonPH: '' },
    { position: 5, playerId: '5', playerName: "O'Neill, C. (1909)", pos: '3B', def: '3e25', bal: '1', simBA: 0.203, simOBP: 0.224, simSLG: 0.241, realBA: 0.203, realOBP: 0.224, realSLG: 0.241, backup1: '', backup2: '', platoonPH: '' },
    { position: 6, playerId: '6', playerName: 'Thomas, H. (1924)', pos: 'LF', def: '1(-3)e5', bal: '1', simBA: 0.300, simOBP: 0.357, simSLG: 0.467, realBA: 0.300, realOBP: 0.357, realSLG: 0.467, backup1: '', backup2: '', platoonPH: '' },
    { position: 7, playerId: '7', playerName: 'McGee, W. (1988)', pos: 'CF', def: '1(0)e12', bal: '1', simBA: 0.292, simOBP: 0.329, simSLG: 0.372, realBA: 0.292, realOBP: 0.329, realSLG: 0.372, backup1: '', backup2: '', platoonPH: '' },
    { position: 8, playerId: '8', playerName: 'Bonds, B. (1969)', pos: 'RF', def: '2(-4)e9', bal: '1', simBA: 0.259, simOBP: 0.351, simSLG: 0.473, realBA: 0.259, realOBP: 0.351, realSLG: 0.473, backup1: '', backup2: '', platoonPH: '' },
  ]);

  // Initial lineup vs RHSP (can include left-handed batters)
  const [vsRHSPLineup] = useState<LineupSlot[]>([
    { position: 1, playerId: '1', playerName: 'Rodriguez, I. (1999)', pos: 'C', def: '1(-5)e1', bal: '1', simBA: 0.332, simOBP: 0.356, simSLG: 0.558, realBA: 0.332, realOBP: 0.356, realSLG: 0.558, backup1: '', backup2: '', platoonPH: '' },
    { position: 2, playerId: '2', playerName: 'Chance, F. (1906)', pos: '1B', def: '1e8', bal: '1', simBA: 0.319, simOBP: 0.419, simSLG: 0.430, realBA: 0.319, realOBP: 0.419, realSLG: 0.430, backup1: '', backup2: '', platoonPH: '' },
    { position: 3, playerId: '3', playerName: 'Boone, B. (2003)', pos: '2B', def: '1e8', bal: '1', simBA: 0.294, simOBP: 0.366, simSLG: 0.535, realBA: 0.294, realOBP: 0.366, realSLG: 0.535, backup1: '', backup2: '', platoonPH: '' },
    { position: 4, playerId: '4', playerName: 'Lansford, C. (1979)', pos: '3B', def: '2e8', bal: '1', simBA: 0.287, simOBP: 0.329, simSLG: 0.436, realBA: 0.287, realOBP: 0.329, realSLG: 0.436, backup1: '', backup2: '', platoonPH: '' },
    { position: 5, playerId: '9', playerName: 'Suzuki, I. (2007)', pos: 'CF', def: '1(-5)e1', bal: '1', simBA: 0.351, simOBP: 0.396, simSLG: 0.431, realBA: 0.351, realOBP: 0.396, realSLG: 0.431, backup1: '', backup2: '', platoonPH: '' },
    { position: 6, playerId: '6', playerName: 'Thomas, H. (1924)', pos: 'LF', def: '1(-3)e5', bal: '1', simBA: 0.300, simOBP: 0.357, simSLG: 0.467, realBA: 0.300, realOBP: 0.357, realSLG: 0.467, backup1: '', backup2: '', platoonPH: '' },
    { position: 7, playerId: '10', playerName: 'Beniquez, J. (1982)', pos: 'LF', def: '1(-2)e7', bal: '1', simBA: 0.265, simOBP: 0.321, simSLG: 0.388, realBA: 0.265, realOBP: 0.321, realSLG: 0.388, backup1: '', backup2: '', platoonPH: '' },
    { position: 8, playerId: '8', playerName: 'Bonds, B. (1969)', pos: 'RF', def: '2(-4)e9', bal: '1', simBA: 0.259, simOBP: 0.351, simSLG: 0.473, realBA: 0.259, realOBP: 0.351, realSLG: 0.473, backup1: '', backup2: '', platoonPH: '' },
  ]);

  const renderLineupTable = (
    lineup: LineupSlot[],
    title: string,
    pitcherHand: 'L' | 'R'
  ) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-green-100">
          This is the lineup that will be used when facing a{' '}
          <strong>{pitcherHand === 'L' ? 'left-handed' : 'right-handed'}</strong> starting
          pitcher.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                Pos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                Def
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                Bal
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                BA
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                OBP
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                SLG
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                BA
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                OBP
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                SLG
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                Backup 1
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                Backup 2
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                Platoon PH
              </th>
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
              <th
                colSpan={3}
                className="px-4 py-1 text-center text-xs text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600"
              >
                Sim vs. {pitcherHand}HSP
              </th>
              <th
                colSpan={3}
                className="px-4 py-1 text-center text-xs text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600"
              >
                Real-life (total)
              </th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600"></th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
              <th className="px-4 py-1 text-xs text-gray-600 dark:text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {lineup.map((slot) => (
              <tr
                key={slot.position}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {slot.position}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  {slot.playerName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {slot.pos}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {slot.def}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {slot.bal}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                  {slot.simBA > 0 ? slot.simBA.toFixed(3) : ''}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                  {slot.simOBP > 0 ? slot.simOBP.toFixed(3) : ''}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                  {slot.simSLG > 0 ? slot.simSLG.toFixed(3) : ''}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                  {slot.realBA > 0 ? slot.realBA.toFixed(3) : ''}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                  {slot.realOBP > 0 ? slot.realOBP.toFixed(3) : ''}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                  {slot.realSLG > 0 ? slot.realSLG.toFixed(3) : ''}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600">
                  {slot.backup1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {slot.backup2}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {slot.platoonPH}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-gray-900">
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">9</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium italic">
                Pitcher
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">P</td>
              <td colSpan={11}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lineup Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Optimize your lineups against left-handed and right-handed starting pitchers
        </p>
      </div>

      {hittersWithStats.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No players on roster yet. Assign players to rosters from the Team Rosters page to
            start optimizing lineups.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Read about how the{' '}
              <a
                href="#"
                className="underline hover:text-blue-600 dark:hover:text-blue-300"
              >
                Lineup Depth Chart
              </a>{' '}
              works, including the new <strong>Platoon PH</strong> feature.
            </p>
          </div>

          {renderLineupTable(vsLHSPLineup, 'Default vs. LHSP', 'L')}
          {renderLineupTable(vsRHSPLineup, 'Default vs. RHSP', 'R')}
        </div>
      )}
    </div>
  );
}
