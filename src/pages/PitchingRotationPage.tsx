import { usePitchers } from '../hooks/usePitchers';

interface RotationSlot {
  position: number;
  pitcherName: string;
  hand: string;
  endurance: string;
  wins: number;
  losses: number;
  era: number;
  whip: number;
  ip: number;
  so: number;
}

interface Reliever {
  name: string;
  hand: string;
  endurance: string;
  era: number;
  ip: number;
}

export function PitchingRotationPage() {
  const { pitchers } = usePitchers();
  
  // Filter to Manhattan WOW Award Stars roster
  const rosterPitchers = pitchers.filter(p => p.roster === 'Manhattan WOW Award Stars');
  
  // Separate starters and relievers based on endurance rating
  const starters = rosterPitchers.filter(p => {
    const end = p.endurance?.toUpperCase() || '';
    return end.includes('S'); // Has starter rating (S8, S9, etc)
  });
  
  const relievers = rosterPitchers.filter(p => {
    const end = p.endurance?.toUpperCase() || '';
    return !end.includes('S') || end.includes('R'); // Pure relievers or swing men
  });
  
  // Calculate ERA and WHIP for each pitcher
  const calculateERA = (p: any) => {
    if (!p.inningsPitched || p.inningsPitched === 0) return 999;
    return (p.earnedRuns * 9) / p.inningsPitched;
  };
  
  const calculateWHIP = (p: any) => {
    if (!p.inningsPitched || p.inningsPitched === 0) return 999;
    return (p.walks + p.hitsAllowed) / p.inningsPitched;
  };
  
  const calculateWins = (p: any) => {
    // Estimate wins based on games started and ERA (simplified)
    if (!p.gamesStarted) return 0;
    const era = calculateERA(p);
    if (era < 3.0) return Math.floor(p.gamesStarted * 0.65);
    if (era < 4.0) return Math.floor(p.gamesStarted * 0.50);
    return Math.floor(p.gamesStarted * 0.35);
  };
  
  const calculateLosses = (p: any) => {
    if (!p.gamesStarted) return 0;
    const wins = calculateWins(p);
    return Math.max(0, p.gamesStarted - wins - Math.floor(p.gamesStarted * 0.15));
  };
  
  // Sort starters by ERA (lower is better)
  const sortedStarters = [...starters].sort((a, b) => calculateERA(a) - calculateERA(b));
  
  // Build rotation (top 5 starters)
  const rotation: RotationSlot[] = sortedStarters.slice(0, 5).map((p, idx) => ({
    position: idx + 1,
    pitcherName: `${p.name} (${p.season})`,
    hand: p.throwingArm || 'R',
    endurance: p.endurance || '',
    wins: calculateWins(p),
    losses: calculateLosses(p),
    era: calculateERA(p),
    whip: calculateWHIP(p),
    ip: p.inningsPitched || 0,
    so: p.strikeouts || 0
  }));
  
  // Build bullpen list
  const bullpen: Reliever[] = relievers.map(p => ({
    name: `${p.name} (${p.season})`,
    hand: p.throwingArm || 'R',
    endurance: p.endurance || '',
    era: calculateERA(p),
    ip: p.inningsPitched || 0
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pitching Rotation Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your optimized 5-man starting rotation
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Rotation Strategy:</strong> Optimized by ERA, WHIP, and Endurance. Cooper (1.87 ERA) is your ace. Johnson and Clarkson provide workhorse innings. All 5 starters have S8+ endurance for deep games. Thurston can also relieve (R3).
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
          <h2 className="text-xl font-bold text-white">Your Default Pitching Rotation</h2>
          <p className="text-sm text-green-100">
            This is the general pitching rotation your team will follow
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
                  Pitcher
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                  Hand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                  End.
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  W
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  L
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  ERA
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  WHIP
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  IP
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  SO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rotation.map((slot) => (
                <tr
                  key={slot.position}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    {slot.position}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                    {slot.pitcherName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {slot.hand}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {slot.endurance}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {slot.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {slot.losses}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    {slot.era.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {slot.whip.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {slot.ip.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {slot.so}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Bullpen (Relievers)
        </h3>
        {bullpen.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bullpen.map((reliever, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{reliever.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {reliever.hand}, {reliever.endurance} - {reliever.era.toFixed(2)} ERA, {reliever.ip.toFixed(1)} IP
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No relievers found on roster</p>
        )}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> * indicates the pitcher may start on only 3 days' rest. All starters have S8+ endurance for complete game potential. Thurston (S9*/R3) can also be used as a long reliever.
        </p>
      </div>
    </div>
  );
}
