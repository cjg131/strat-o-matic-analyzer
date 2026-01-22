import { useMemo } from 'react';
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

  // User's roster is hardcoded below - not pulling from database
  const hittersWithStats: HitterWithStats[] = [];

  // Helper to get defensive position string
  const getDefensiveString = (hitter: HitterWithStats): string => {
    if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) {
      return '';
    }
    const pos = hitter.defensivePositions[0];
    let defStr = '';
    if (pos.range) defStr += pos.range;
    if (pos.arm) defStr += `(${pos.arm})`;
    if (pos.error !== undefined) defStr += `e${pos.error}`;
    return defStr;
  };

  // Helper to determine if hitter is left-handed (check balance field)
  const isLeftHanded = (hitter: HitterWithStats): boolean => {
    // Balance field format: "L" for left, "R" for right, "S" for switch, or number for switch
    return hitter.balance?.toUpperCase() === 'L';
  };

  // Helper to determine if hitter is switch hitter
  const isSwitchHitter = (hitter: HitterWithStats): boolean => {
    // Switch hitters have balance as "S" or a number (1-3)
    const bal = hitter.balance?.toUpperCase();
    return bal === 'S' || !isNaN(Number(hitter.balance));
  };

  // Calculate batting stats from raw data
  const calculateBattingStats = (h: HitterWithStats) => {
    const ba = h.ab > 0 ? h.h / h.ab : 0;
    const obp = h.plateAppearances > 0 
      ? (h.h + h.walks + h.hitByPitch) / h.plateAppearances 
      : 0;
    const totalBases = h.singles + (h.doubles * 2) + (h.triples * 3) + (h.homeRuns * 4);
    const slg = h.ab > 0 ? totalBases / h.ab : 0;
    return { ba, obp, slg };
  };

  // Optimize lineup using traditional baseball lineup construction + FP
  const optimizeLineup = (availableHitters: HitterWithStats[]): HitterWithStats[] => {
    if (availableHitters.length === 0) return [];

    const sorted = [...availableHitters];
    
    // Calculate composite score for each hitter
    const scoredHitters = sorted.map(h => {
      const { ba, obp, slg } = calculateBattingStats(h);
      const ops = obp + slg;
      const fp = h.fantasyPoints || 0;
      const sb = h.stolenBases || 0;
      
      return {
        hitter: h,
        ba,
        obp,
        slg,
        ops,
        fp,
        sb,
        // Leadoff score: OBP + speed
        leadoffScore: obp * 1000 + sb * 2,
        // Contact score: BA + OBP
        contactScore: (ba + obp) * 500,
        // Power score: SLG + HR
        powerScore: slg * 1000 + (h.homeRuns || 0) * 5,
        // Overall value: FP + OPS
        overallScore: fp + ops * 100
      };
    });

    // Sort by overall score first
    scoredHitters.sort((a, b) => b.overallScore - a.overallScore);

    const lineup: HitterWithStats[] = [];
    const used = new Set<string>();

    // 1. Leadoff: Best OBP + Speed
    const leadoffCandidates = scoredHitters.filter(s => !used.has(s.hitter.id));
    leadoffCandidates.sort((a, b) => b.leadoffScore - a.leadoffScore);
    if (leadoffCandidates[0]) {
      lineup.push(leadoffCandidates[0].hitter);
      used.add(leadoffCandidates[0].hitter.id);
    }

    // 2. Second: Best contact hitter (high BA/OBP, can move runner)
    const contactCandidates = scoredHitters.filter(s => !used.has(s.hitter.id));
    contactCandidates.sort((a, b) => b.contactScore - a.contactScore);
    if (contactCandidates[0]) {
      lineup.push(contactCandidates[0].hitter);
      used.add(contactCandidates[0].hitter.id);
    }

    // 3. Third: Best overall hitter (highest OPS + FP)
    const bestOverall = scoredHitters.filter(s => !used.has(s.hitter.id));
    bestOverall.sort((a, b) => b.overallScore - a.overallScore);
    if (bestOverall[0]) {
      lineup.push(bestOverall[0].hitter);
      used.add(bestOverall[0].hitter.id);
    }

    // 4. Fourth (Cleanup): Most power
    const powerCandidates = scoredHitters.filter(s => !used.has(s.hitter.id));
    powerCandidates.sort((a, b) => b.powerScore - a.powerScore);
    if (powerCandidates[0]) {
      lineup.push(powerCandidates[0].hitter);
      used.add(powerCandidates[0].hitter.id);
    }

    // 5-8: Fill remaining spots with best available by overall score
    const remaining = scoredHitters.filter(s => !used.has(s.hitter.id));
    remaining.sort((a, b) => b.overallScore - a.overallScore);
    
    for (const scored of remaining) {
      if (lineup.length >= 8) break;
      lineup.push(scored.hitter);
      used.add(scored.hitter.id);
    }

    return lineup;
  };

  // Optimized lineup vs LHSP - Right-handed and switch hitters only
  // Optimized by: 1. Chance (OBP .419), 2. Rodriguez (power .558 SLG), 3. Matsui (switch), 
  // 4. Lansford (power), 5. Bowa (switch, speed), 6. Thomas (power), 7. McGee (switch), 8. Weatherston
  const vsLHSPLineup: LineupSlot[] = [
    { position: 1, playerId: '1', playerName: 'Chance, F. (1906)', pos: '1B', def: '1e8', bal: '1', simBA: 0.319, simOBP: 0.419, simSLG: 0.430, realBA: 0.319, realOBP: 0.419, realSLG: 0.430, backup1: 'Chase, H.', backup2: '', platoonPH: '' },
    { position: 2, playerId: '2', playerName: 'Rodriguez, I. (1999)', pos: 'C', def: '1(-5)e1', bal: '1', simBA: 0.332, simOBP: 0.356, simSLG: 0.558, realBA: 0.332, realOBP: 0.356, realSLG: 0.558, backup1: 'Killefer, B.', backup2: '', platoonPH: '' },
    { position: 3, playerId: '3', playerName: 'Matsui, K. (2007)', pos: '2B', def: '2e6', bal: '3', simBA: 0.288, simOBP: 0.342, simSLG: 0.405, realBA: 0.288, realOBP: 0.342, realSLG: 0.405, backup1: '', backup2: '', platoonPH: 'Gordon, D.' },
    { position: 4, playerId: '4', playerName: 'Lansford, C. (1979)', pos: '3B', def: '2e8', bal: '1', simBA: 0.287, simOBP: 0.329, simSLG: 0.436, realBA: 0.287, realOBP: 0.329, realSLG: 0.436, backup1: "O'Leary, C.", backup2: '', platoonPH: '' },
    { position: 5, playerId: '5', playerName: 'Bowa, L. (1978)', pos: 'SS', def: '1e10', bal: '1', simBA: 0.294, simOBP: 0.319, simSLG: 0.370, realBA: 0.294, realOBP: 0.319, realSLG: 0.370, backup1: '', backup2: '', platoonPH: '' },
    { position: 6, playerId: '6', playerName: 'Thomas, H. (1924)', pos: 'LF', def: '1(-3)e5', bal: '1', simBA: 0.300, simOBP: 0.357, simSLG: 0.467, realBA: 0.300, realOBP: 0.357, realSLG: 0.467, backup1: '', backup2: '', platoonPH: '' },
    { position: 7, playerId: '7', playerName: 'McGee, W. (1988)', pos: 'CF', def: '1(0)e12', bal: '1', simBA: 0.292, simOBP: 0.329, simSLG: 0.372, realBA: 0.292, realOBP: 0.329, realSLG: 0.372, backup1: '', backup2: '', platoonPH: '' },
    { position: 8, playerId: '8', playerName: 'Weatherston, C. (1983)', pos: 'RF', def: '3(-3)e9', bal: '1', simBA: 0.278, simOBP: 0.322, simSLG: 0.413, realBA: 0.278, realOBP: 0.322, realSLG: 0.413, backup1: '', backup2: '', platoonPH: '' },
  ];

  // Optimized lineup vs RHSP - Include left-handed batters for platoon advantage
  // Optimized by: 1. Gwynn (.447 OBP), 2. Chance (.419 OBP), 3. Suzuki (.396 OBP, speed), 
  // 4. Rodriguez (power), 5. Gordon (L, speed), 6. Thomas (power), 7. Lansford, 8. Bowa
  const vsRHSPLineup: LineupSlot[] = [
    { position: 1, playerId: '1', playerName: 'Gwynn, T. (1987)', pos: 'RF', def: '1(-2)e7', bal: '1', simBA: 0.370, simOBP: 0.447, simSLG: 0.511, realBA: 0.370, realOBP: 0.447, realSLG: 0.511, backup1: 'Weatherston, C.', backup2: '', platoonPH: '' },
    { position: 2, playerId: '2', playerName: 'Chance, F. (1906)', pos: '1B', def: '1e8', bal: '1', simBA: 0.319, simOBP: 0.419, simSLG: 0.430, realBA: 0.319, realOBP: 0.419, realSLG: 0.430, backup1: 'Chase, H.', backup2: '', platoonPH: '' },
    { position: 3, playerId: '3', playerName: 'Suzuki, I. (2007)', pos: 'CF', def: '1(-5)e1', bal: '1', simBA: 0.351, simOBP: 0.396, simSLG: 0.431, realBA: 0.351, realOBP: 0.396, realSLG: 0.431, backup1: 'McGee, W.', backup2: '', platoonPH: '' },
    { position: 4, playerId: '4', playerName: 'Rodriguez, I. (1999)', pos: 'C', def: '1(-5)e1', bal: '1', simBA: 0.332, simOBP: 0.356, simSLG: 0.558, realBA: 0.332, realOBP: 0.356, realSLG: 0.558, backup1: 'Killefer, B.', backup2: '', platoonPH: '' },
    { position: 5, playerId: '5', playerName: 'Gordon, D. (2015)', pos: '2B', def: '1e6', bal: '1', simBA: 0.333, simOBP: 0.359, simSLG: 0.418, realBA: 0.333, realOBP: 0.359, realSLG: 0.418, backup1: 'Matsui, K.', backup2: '', platoonPH: '' },
    { position: 6, playerId: '6', playerName: 'Thomas, H. (1924)', pos: 'LF', def: '1(-3)e5', bal: '1', simBA: 0.300, simOBP: 0.357, simSLG: 0.467, realBA: 0.300, realOBP: 0.357, realSLG: 0.467, backup1: '', backup2: '', platoonPH: '' },
    { position: 7, playerId: '7', playerName: 'Lansford, C. (1979)', pos: '3B', def: '2e8', bal: '1', simBA: 0.287, simOBP: 0.329, simSLG: 0.436, realBA: 0.287, realOBP: 0.329, realSLG: 0.436, backup1: "O'Leary, C.", backup2: '', platoonPH: '' },
    { position: 8, playerId: '8', playerName: 'Bowa, L. (1978)', pos: 'SS', def: '1e10', bal: '1', simBA: 0.294, simOBP: 0.319, simSLG: 0.370, realBA: 0.294, realOBP: 0.319, realSLG: 0.370, backup1: '', backup2: '', platoonPH: '' },
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
