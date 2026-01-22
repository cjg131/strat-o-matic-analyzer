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

export function PitchingRotationPage() {
  // Optimized 5-man rotation based on ERA, WHIP, IP, and Endurance
  // 1. Cooper (1.87 ERA, S8) - Ace
  // 2. Johnson (2.56 ERA, S8*) - #2 starter
  // 3. Clarkson (2.76 ERA, S9*) - #3 starter, most IP
  // 4. Fraser (3.81 ERA, S9*) - #4 starter
  // 5. Thurston (3.80 ERA, S9*/R3) - #5 starter, can swing
  const rotation: RotationSlot[] = [
    { position: 1, pitcherName: 'Cooper, W. (1916)', hand: 'L', endurance: 'S8', wins: 12, losses: 11, era: 1.87, whip: 1.07, ip: 246.0, so: 111 },
    { position: 2, pitcherName: 'Johnson, S. (1916)', hand: 'R', endurance: 'S8*', wins: 31, losses: 13, era: 2.56, whip: 1.26, ip: 366.0, so: 131 },
    { position: 3, pitcherName: 'Clarkson, J. (1888)', hand: 'R', endurance: 'S9*', wins: 33, losses: 20, era: 2.76, whip: 1.17, ip: 483.1, so: 223 },
    { position: 4, pitcherName: 'Fraser, C. (1901)', hand: 'R', endurance: 'S9*', wins: 22, losses: 16, era: 3.81, whip: 1.44, ip: 331.0, so: 110 },
    { position: 5, pitcherName: 'Thurston, S. (1924)', hand: 'R', endurance: 'S9*/R3', wins: 20, losses: 14, era: 3.80, whip: 1.34, ip: 291.0, so: 37 },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Earnshaw, G. (1930)</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">R, S8*/R4 - 4.44 ERA, 296.0 IP</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Drabowsky, M. (1966)</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">R, R4 - 2.81 ERA, 96.0 IP</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Fisher, B. (1986)</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">R, R2 - 4.93 ERA, 96.2 IP</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Laroche, D. (1979)</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">L, R2 - 5.57 ERA, 85.2 IP</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Mooney, J. (1934)</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">L, R4 - 5.47 ERA, 82.1 IP</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> * indicates the pitcher may start on only 3 days' rest. All starters have S8+ endurance for complete game potential. Thurston (S9*/R3) can also be used as a long reliever.
        </p>
      </div>
    </div>
  );
}
