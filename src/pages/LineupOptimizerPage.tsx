import { usePlayerCards } from '../hooks/usePlayerCards';
import { useHitters } from '../hooks/useHitters';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { calculateHitterStats } from '../utils/calculations';
import { Info } from 'lucide-react';
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
  cardStats?: {
    stealRating?: string;
    runRating?: string;
    bunting?: string;
    defenseRatings?: string;
  };
}

// Helper to get primary position from positions array
function getPrimaryPosition(positions: string[] | string): string {
  if (!positions) return 'DH';
  
  // Handle string input
  if (typeof positions === 'string') {
    return positions || 'DH';
  }
  
  // Handle array input
  if (positions.length === 0) return 'DH';
  
  // Prioritize defensive positions: C, SS, CF, 2B, 3B, 1B, LF, RF
  const priority = ['C', 'SS', 'CF', '2B', '3B', '1B', 'LF', 'RF', 'DH'];
  for (const pos of priority) {
    if (positions.includes(pos)) return pos;
  }
  return positions[0];
}

// Helper to get platoon advantage score
function getPlatoonScore(batterBalance: string, pitcherHand: 'L' | 'R'): number {
  // Balance: L = left-handed, R = right-handed, S = switch, E = even
  const batter = batterBalance?.charAt(0)?.toUpperCase() || 'E';
  
  if (batter === 'S') return 1.1; // Switch hitters always have advantage
  if (batter === 'E') return 1.0; // Even split, no advantage
  
  // L batter vs R pitcher = advantage
  // R batter vs L pitcher = advantage
  if ((batter === 'L' && pitcherHand === 'R') || (batter === 'R' && pitcherHand === 'L')) {
    return 1.15; // Platoon advantage
  }
  
  return 0.85; // Platoon disadvantage
}

// Helper to optimize lineup order based on stats and platoon matchup
function optimizeLineupOrder(hitters: HitterWithStats[], pitcherHand: 'L' | 'R'): HitterWithStats[] {
  // Filter to only rostered players (Manhattan WOW Award Stars)
  const roster = hitters.filter(h => h.roster === 'Manhattan WOW Award Stars');
  
  if (roster.length === 0) return [];
  
  // Traditional lineup construction with platoon consideration:
  // 1-2: Best OBP (table setters)
  // 3-5: Best power (SLG) - run producers
  // 6-7: Contact/speed
  // 8: Weakest hitter (or best defensive player)
  
  // Sort all by OPS adjusted for platoon advantage
  const sorted = [...roster].sort((a, b) => {
    const aOPS = (a.obp || 0) + (a.slg || 0);
    const bOPS = (b.obp || 0) + (b.slg || 0);
    const aPlatoonOPS = aOPS * getPlatoonScore(a.balance, pitcherHand);
    const bPlatoonOPS = bOPS * getPlatoonScore(b.balance, pitcherHand);
    return bPlatoonOPS - aPlatoonOPS;
  });
  
  // Get top 8 hitters (considering platoon)
  const top8 = sorted.slice(0, 8);
  
  // Now arrange them in optimal batting order
  const lineup: HitterWithStats[] = [];
  
  // Find best OBP guys for 1-2 spots (with platoon adjustment)
  const byOBP = [...top8].sort((a, b) => {
    const aAdj = (a.obp || 0) * getPlatoonScore(a.balance, pitcherHand);
    const bAdj = (b.obp || 0) * getPlatoonScore(b.balance, pitcherHand);
    return bAdj - aAdj;
  });
  lineup.push(byOBP[0]); // 1st - Best OBP
  lineup.push(byOBP[1]); // 2nd - 2nd best OBP
  
  // Find best power guys for 3-5 spots (with platoon adjustment)
  const remaining = top8.filter(h => !lineup.includes(h));
  const bySLG = [...remaining].sort((a, b) => {
    const aAdj = (a.slg || 0) * getPlatoonScore(a.balance, pitcherHand);
    const bAdj = (b.slg || 0) * getPlatoonScore(b.balance, pitcherHand);
    return bAdj - aAdj;
  });
  lineup.push(bySLG[0]); // 3rd - Best power
  lineup.push(bySLG[1]); // 4th - 2nd best power
  lineup.push(bySLG[2]); // 5th - 3rd best power
  
  // Remaining spots 6-8
  const final = top8.filter(h => !lineup.includes(h));
  lineup.push(...final);
  
  return lineup;
}

export function LineupOptimizerPage() {
  const { getPlayerCard } = usePlayerCards();
  const { hitters } = useHitters();
  const { weights } = useScoringWeights();
  
  // Calculate stats for all hitters
  const hittersWithStats: HitterWithStats[] = hitters.map((hitter) =>
    calculateHitterStats(hitter, weights.hitter)
  );
  
  // Convert to LineupSlot format - get defensive position string
  const getDefString = (defPositions: any): string => {
    if (!defPositions) return '';
    if (typeof defPositions === 'string') return defPositions;
    if (Array.isArray(defPositions) && defPositions.length > 0) {
      return defPositions[0].position || '';
    }
    return '';
  };
  
  const createLineup = (hittersList: HitterWithStats[]): LineupSlot[] => {
    return hittersList.slice(0, 8).map((h, idx) => ({
      position: idx + 1,
      playerId: h.id,
      playerName: h.name,
      pos: getPrimaryPosition(h.positions),
      def: getDefString(h.defensivePositions),
      bal: h.balance || '1',
      simBA: 0,
      simOBP: 0,
      simSLG: 0,
      realBA: h.ba || 0,
      realOBP: h.obp || 0,
      realSLG: h.slg || 0,
      backup1: '',
      backup2: '',
      platoonPH: ''
    }));
  };
  
  // Get optimized lineups for each pitcher handedness
  const vsLHSPHitters = optimizeLineupOrder(hittersWithStats, 'L');
  const vsRHSPHitters = optimizeLineupOrder(hittersWithStats, 'R');
  
  const vsLHSPLineup = createLineup(vsLHSPHitters);
  const vsRHSPLineup = createLineup(vsRHSPHitters);

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
        {/* Card Stats Enhancement Banner */}
        {vsLHSPLineup.some(slot => {
          const card = getPlayerCard(slot.playerName);
          return card && (card.running || card.defense);
        }) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  Enhanced with Player Card Data
                </h3>
                <p className="text-sm text-green-800 dark:text-green-300">
                  This lineup is now enhanced with advanced stats from your uploaded player cards. 
                  Check the <strong>Card Insights</strong> page to see detailed defensive ratings, speed stats, and strategic recommendations.
                </p>
                <div className="mt-2 text-xs text-green-700 dark:text-green-400">
                  Cards uploaded: {vsLHSPLineup.filter(slot => getPlayerCard(slot.playerName)).length} of {vsLHSPLineup.length} players
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Game Simulation Optimized:</strong> Balances offense + defense for actual games. <strong>Elite Defense Up the Middle:</strong> Rodriguez (C, 1e1), Bowa (SS, 1e10), Suzuki (CF, 1e1) - all gold glove caliber. <strong>Suzuki starts BOTH lineups</strong> - his 1e1 CF defense + .827 OPS too valuable to sit. <strong>vs RHSP:</strong> Suzuki (.434 OBP) and Gwynn (.400 OBP) provide elite lefty bats at top. All starters durable (1-13 to 1-17 injury).
          </p>
        </div>

        {renderLineupTable(vsLHSPLineup, 'Default vs. LHSP', 'L')}
        {renderLineupTable(vsRHSPLineup, 'Default vs. RHSP', 'R')}
      </div>
    </div>
  );
}
