import { useState } from 'react';

interface HitterPreference {
  name: string;
  hand: string;
  position: string;
  balance: string;
  avoidLHP: boolean;
  avoidRHP: boolean;
  moreSacBunt: boolean;
  dontSacBunt: boolean;
  moreHitAndRun: boolean;
  dontHitAndRun: boolean;
  moreSteal: boolean;
  dontSteal: boolean;
  dontPHvsLHP: boolean;
  dontPHvsRHP: boolean;
  avoidPHInBlowouts: boolean;
  rememberFor4DefSub: boolean;
  pinchRunForDont: boolean;
}

export function HitterPreferencesPage() {
  const [preferences, setPreferences] = useState<HitterPreference[]>([
    // Rodriguez - C, Stl: A, 1R balance, power (.558 SLG), elite defense
    { name: 'Rodriguez, Ivan', hand: 'R', position: 'C', balance: '1R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: true, moreHitAndRun: false, dontHitAndRun: false, moreSteal: false, dontSteal: false, dontPHvsLHP: true, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: true, pinchRunForDont: false },
    // Killefer - Backup C, Stl: B, E balance, weak bat
    { name: 'Killefer, Bill', hand: 'R', position: 'C', balance: 'E', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: false, dontHitAndRun: false, moreSteal: false, dontSteal: true, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: true },
    // Chance - 1B, Stl: AA, 1L balance, contact hitter (.849 OPS)
    { name: 'Chance, Frank', hand: 'R', position: '1B', balance: '1L', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: true, moreHitAndRun: true, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: true, dontPHvsRHP: false, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    // Chase - Bench 1B, Stl: AA, E balance, defensive sub
    { name: 'Chase, Hal', hand: 'R', position: '1B', balance: 'E', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: false, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    // Gordon - 2B, Stl: AA, 1L balance, elite speed (.777 OPS)
    { name: 'Gordon, Dee', hand: 'L', position: '2B', balance: '1L', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: true, moreHitAndRun: true, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    // Matsui - 2B, Stl: AA, 1R balance, speed + contact
    { name: 'Matsui, Kaz', hand: 'S', position: '2B', balance: '1R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: true, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: false, pinchRunForDont: false },
    // Lansford - 3B, Stl: A, E balance, solid regular
    { name: 'Lansford, Carney', hand: 'R', position: '3B', balance: 'E', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: true, dontHitAndRun: false, moreSteal: false, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: false, pinchRunForDont: false },
    // O'Leary - Bench 3B, Stl: A, 1L balance, defensive sub
    { name: "O'Leary, Charley", hand: 'R', position: '3B', balance: '1L', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: false, dontHitAndRun: false, moreSteal: false, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    // Bowa - SS, Stl: A, 1R balance, elite defense
    { name: 'Bowa, Larry', hand: 'S', position: 'SS', balance: '1R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: true, dontHitAndRun: false, moreSteal: false, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    // Thomas - LF, Stl: A, 1R balance, POWER (.467 SLG, 12 HR)
    { name: 'Thomas, Hawk', hand: 'R', position: 'LF', balance: '1R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: true, moreHitAndRun: false, dontHitAndRun: false, moreSteal: false, dontSteal: false, dontPHvsLHP: true, dontPHvsRHP: false, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    // Suzuki - CF, Stl: AA, 1R balance, elite contact + speed
    { name: 'Suzuki, Ichiro', hand: 'L', position: 'CF', balance: '1R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: true, moreHitAndRun: true, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    // McGee - Backup CF, Stl: AA, E balance, defensive sub + speed
    { name: 'McGee, Willie', hand: 'S', position: 'CF', balance: 'E', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: true, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    // Gwynn - RF, Stl: AA, 1R balance, elite contact + speed
    { name: 'Gwynn, Tony', hand: 'L', position: 'RF', balance: '1R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: true, moreHitAndRun: true, dontHitAndRun: false, moreSteal: true, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    // Washington - Bench RF, Stl: A, 3R balance
    { name: 'Washington, Claudell', hand: 'L', position: 'RF', balance: '3R', avoidLHP: false, avoidRHP: false, moreSacBunt: false, dontSacBunt: false, moreHitAndRun: false, dontHitAndRun: false, moreSteal: false, dontSteal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: false, pinchRunForDont: false },
  ]);

  const togglePreference = (index: number, field: keyof HitterPreference) => {
    const newPreferences = [...preferences];
    const currentValue = newPreferences[index][field];
    if (typeof currentValue === 'boolean') {
      newPreferences[index] = {
        ...newPreferences[index],
        [field]: !currentValue
      };
      setPreferences(newPreferences);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hitter Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Strategic settings optimized for your roster's strengths
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Strategy Applied:</strong> AA stealers (Gwynn, Suzuki, Gordon, Matsui, McGee, Chance, Chase) set to "More Steal". A stealers neutral. Only B stealers (Killefer) set to "Don't Steal". Elite defenders marked for defensive subs. Power hitters avoid sac bunts.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Hitters</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">B</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">P</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Bal.</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Avoid</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Sac bunt</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Hit & run</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Steal</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Don't PH for vs.</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Avoid PH<br/>in blowouts</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Rem. 4 def sub<br/>with lead</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">PR for<br/>Don't</th>
              </tr>
              <tr>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">LHP</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">RHP</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">More</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Don't</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">More</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Don't</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">More</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Don't</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">LHP</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">RHP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {preferences.map((pref, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium border-r border-gray-200 dark:border-gray-700">{pref.name}</td>
                  <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.hand}</td>
                  <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.position}</td>
                  <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{pref.balance}</td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={pref.avoidLHP} onChange={() => togglePreference(index, 'avoidLHP')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.avoidRHP} onChange={() => togglePreference(index, 'avoidRHP')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={pref.moreSacBunt} onChange={() => togglePreference(index, 'moreSacBunt')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.dontSacBunt} onChange={() => togglePreference(index, 'dontSacBunt')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={pref.moreHitAndRun} onChange={() => togglePreference(index, 'moreHitAndRun')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.dontHitAndRun} onChange={() => togglePreference(index, 'dontHitAndRun')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={pref.moreSteal} onChange={() => togglePreference(index, 'moreSteal')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.dontSteal} onChange={() => togglePreference(index, 'dontSteal')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={pref.dontPHvsLHP} onChange={() => togglePreference(index, 'dontPHvsLHP')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.dontPHvsRHP} onChange={() => togglePreference(index, 'dontPHvsRHP')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.avoidPHInBlowouts} onChange={() => togglePreference(index, 'avoidPHInBlowouts')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" checked={pref.rememberFor4DefSub} onChange={() => togglePreference(index, 'rememberFor4DefSub')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={pref.pinchRunForDont} onChange={() => togglePreference(index, 'pinchRunForDont')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Strategy Breakdown</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>AA Stealers (Gwynn, Suzuki, Gordon, Matsui, McGee, Chance, Chase):</strong> "More Steal" enabled - elite base stealing ability. Hit-and-run capable.
          </div>
          <div>
            <strong>A Stealers (Rodriguez, Thomas, Bowa, Lansford, O'Leary, Washington):</strong> Good steal ratings but neutral settings - let game situation dictate.
          </div>
          <div>
            <strong>B Stealers (Killefer):</strong> "Don't Steal" - poor success rate, available for pinch running only.
          </div>
          <div>
            <strong>Power Hitters (Rodriguez, Thomas, Chance):</strong> Avoid sac bunts to maximize run production. Protected from PH in favorable matchups.
          </div>
          <div>
            <strong>Elite Defenders (Rodriguez C, Bowa SS, McGee CF, Chase 1B, O'Leary 3B, Killefer C):</strong> Marked for defensive substitutions with lead.
          </div>
          <div>
            <strong>Starters:</strong> Protected in blowouts to preserve health and avoid unnecessary injury risk.
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
