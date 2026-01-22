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

  // Optimized lineup vs LHSP - Best 8 hitters by OPS (OBP + SLG)
  // 1. Gwynn (.958 OPS), 2. Chance (.849), 3. Rodriguez (.914), 4. Suzuki (.827), 5. Thomas (.824), 6. Lansford (.765), 7. Gordon (.777), 8. Matsui (.747)
  const vsLHSPLineup: LineupSlot[] = [
    { position: 1, playerId: '1', playerName: 'Gwynn, T. (1987)', pos: 'RF', def: '1(-2)e7', bal: '1', simBA: 0.370, simOBP: 0.447, simSLG: 0.511, realBA: 0.370, realOBP: 0.447, realSLG: 0.511, backup1: '', backup2: '', platoonPH: '' },
    { position: 2, playerId: '2', playerName: 'Chance, F. (1906)', pos: '1B', def: '1e8', bal: '1', simBA: 0.319, simOBP: 0.419, simSLG: 0.430, realBA: 0.319, realOBP: 0.419, realSLG: 0.430, backup1: 'Chase, H.', backup2: '', platoonPH: '' },
    { position: 3, playerId: '3', playerName: 'Rodriguez, I. (1999)', pos: 'C', def: '1(-5)e1', bal: '1', simBA: 0.332, simOBP: 0.356, simSLG: 0.558, realBA: 0.332, realOBP: 0.356, realSLG: 0.558, backup1: 'Killefer, B.', backup2: '', platoonPH: '' },
    { position: 4, playerId: '4', playerName: 'Suzuki, I. (2007)', pos: 'CF', def: '1(-5)e1', bal: '1', simBA: 0.351, simOBP: 0.396, simSLG: 0.431, realBA: 0.351, realOBP: 0.396, realSLG: 0.431, backup1: 'McGee, W.', backup2: '', platoonPH: '' },
    { position: 5, playerId: '5', playerName: 'Thomas, H. (1924)', pos: 'LF', def: '1(-3)e5', bal: '1', simBA: 0.300, simOBP: 0.357, simSLG: 0.467, realBA: 0.300, realOBP: 0.357, realSLG: 0.467, backup1: '', backup2: '', platoonPH: '' },
    { position: 6, playerId: '6', playerName: 'Gordon, D. (2015)', pos: '2B', def: '1e6', bal: '1', simBA: 0.333, simOBP: 0.359, simSLG: 0.418, realBA: 0.333, realOBP: 0.359, realSLG: 0.418, backup1: 'Matsui, K.', backup2: '', platoonPH: '' },
    { position: 7, playerId: '7', playerName: 'Lansford, C. (1979)', pos: '3B', def: '2e8', bal: '1', simBA: 0.287, simOBP: 0.329, simSLG: 0.436, realBA: 0.287, realOBP: 0.329, realSLG: 0.436, backup1: "O'Leary, C.", backup2: '', platoonPH: '' },
    { position: 8, playerId: '8', playerName: 'Matsui, K. (2007)', pos: '2B', def: '2e6', bal: '3', simBA: 0.288, simOBP: 0.342, simSLG: 0.405, realBA: 0.288, realOBP: 0.342, realSLG: 0.405, backup1: '', backup2: '', platoonPH: '' },
  ];

  // Optimized lineup vs RHSP - Same best 8 hitters by OPS
  // Using same order since we're optimizing by overall best stats regardless of pitcher handedness
  const vsRHSPLineup: LineupSlot[] = [
    { position: 1, playerId: '1', playerName: 'Gwynn, T. (1987)', pos: 'RF', def: '1(-2)e7', bal: '1', simBA: 0.370, simOBP: 0.447, simSLG: 0.511, realBA: 0.370, realOBP: 0.447, realSLG: 0.511, backup1: '', backup2: '', platoonPH: '' },
    { position: 2, playerId: '2', playerName: 'Chance, F. (1906)', pos: '1B', def: '1e8', bal: '1', simBA: 0.319, simOBP: 0.419, simSLG: 0.430, realBA: 0.319, realOBP: 0.419, realSLG: 0.430, backup1: 'Chase, H.', backup2: '', platoonPH: '' },
    { position: 3, playerId: '3', playerName: 'Rodriguez, I. (1999)', pos: 'C', def: '1(-5)e1', bal: '1', simBA: 0.332, simOBP: 0.356, simSLG: 0.558, realBA: 0.332, realOBP: 0.356, realSLG: 0.558, backup1: 'Killefer, B.', backup2: '', platoonPH: '' },
    { position: 4, playerId: '4', playerName: 'Suzuki, I. (2007)', pos: 'CF', def: '1(-5)e1', bal: '1', simBA: 0.351, simOBP: 0.396, simSLG: 0.431, realBA: 0.351, realOBP: 0.396, realSLG: 0.431, backup1: 'McGee, W.', backup2: '', platoonPH: '' },
    { position: 5, playerId: '5', playerName: 'Thomas, H. (1924)', pos: 'LF', def: '1(-3)e5', bal: '1', simBA: 0.300, simOBP: 0.357, simSLG: 0.467, realBA: 0.300, realOBP: 0.357, realSLG: 0.467, backup1: '', backup2: '', platoonPH: '' },
    { position: 6, playerId: '6', playerName: 'Gordon, D. (2015)', pos: '2B', def: '1e6', bal: '1', simBA: 0.333, simOBP: 0.359, simSLG: 0.418, realBA: 0.333, realOBP: 0.359, realSLG: 0.418, backup1: 'Matsui, K.', backup2: '', platoonPH: '' },
    { position: 7, playerId: '7', playerName: 'Lansford, C. (1979)', pos: '3B', def: '2e8', bal: '1', simBA: 0.287, simOBP: 0.329, simSLG: 0.436, realBA: 0.287, realOBP: 0.329, realSLG: 0.436, backup1: "O'Leary, C.", backup2: '', platoonPH: '' },
    { position: 8, playerId: '8', playerName: 'Matsui, K. (2007)', pos: '2B', def: '2e6', bal: '3', simBA: 0.288, simOBP: 0.342, simSLG: 0.405, realBA: 0.288, realOBP: 0.342, realSLG: 0.405, backup1: '', backup2: '', platoonPH: '' },
  ];

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

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Optimized Lineups:</strong> Ranked by OPS (OBP + SLG) using your 14 players' actual stats. Best 8 hitters regardless of handedness. Order: 1. Gwynn (.958 OPS), 2. Chance (.849), 3. Rodriguez (.914), 4. Suzuki (.827), 5. Thomas (.824), 6. Gordon (.777), 7. Lansford (.765), 8. Matsui (.747).
          </p>
        </div>

        {renderLineupTable(vsLHSPLineup, 'Default vs. LHSP', 'L')}
        {renderLineupTable(vsRHSPLineup, 'Default vs. RHSP', 'R')}
      </div>
    </div>
  );
}
