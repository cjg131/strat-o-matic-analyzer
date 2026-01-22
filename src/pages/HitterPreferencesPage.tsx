import { useState } from 'react';

interface HitterPreference {
  name: string;
  hand: string;
  position: string;
  balance: string;
  avoidSacBunt: boolean;
  hitAndRun: boolean;
  steal: boolean;
  dontPHvsLHP: boolean;
  dontPHvsRHP: boolean;
  avoidPHInBlowouts: boolean;
  rememberFor4DefSub: boolean;
  pinchRunForDont: boolean;
}

export function HitterPreferencesPage() {
  const [preferences, setPreferences] = useState<HitterPreference[]>([
    // Elite speed/contact players - aggressive baserunning
    { name: 'Gwynn, Tony', hand: 'L', position: 'RF', balance: '1R', avoidSacBunt: true, hitAndRun: true, steal: true, dontPHvsLHP: false, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    { name: 'Suzuki, Ichiro', hand: 'L', position: 'CF', balance: '1R', avoidSacBunt: true, hitAndRun: true, steal: true, dontPHvsLHP: false, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    { name: 'Gordon, Dee', hand: 'L', position: '2B', balance: '1L', avoidSacBunt: true, hitAndRun: true, steal: true, dontPHvsLHP: false, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    
    // Elite catchers - never pinch hit, defensive subs
    { name: 'Rodriguez, Ivan', hand: 'R', position: 'C', balance: '1R', avoidSacBunt: true, hitAndRun: false, steal: false, dontPHvsLHP: true, dontPHvsRHP: true, avoidPHInBlowouts: true, rememberFor4DefSub: true, pinchRunForDont: false },
    { name: 'Killefer, Bill', hand: 'R', position: 'C', balance: 'E', avoidSacBunt: false, hitAndRun: false, steal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: true },
    
    // Power hitters - avoid sac bunt, no steal
    { name: 'Thomas, Hawk', hand: 'R', position: 'LF', balance: '1R', avoidSacBunt: true, hitAndRun: false, steal: false, dontPHvsLHP: true, dontPHvsRHP: false, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    
    // Contact hitters - hit & run capable
    { name: 'Chance, Frank', hand: 'R', position: '1B', balance: '1L', avoidSacBunt: true, hitAndRun: true, steal: false, dontPHvsLHP: true, dontPHvsRHP: false, avoidPHInBlowouts: true, rememberFor4DefSub: false, pinchRunForDont: false },
    { name: 'Matsui, Kaz', hand: 'S', position: '2B', balance: '1R', avoidSacBunt: false, hitAndRun: true, steal: true, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: false, pinchRunForDont: false },
    
    // Elite defenders - remember for defensive subs
    { name: 'Bowa, Larry', hand: 'S', position: 'SS', balance: '1R', avoidSacBunt: false, hitAndRun: true, steal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    { name: 'McGee, Willie', hand: 'S', position: 'CF', balance: 'E', avoidSacBunt: false, hitAndRun: true, steal: true, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    
    // Solid regulars
    { name: 'Lansford, Carney', hand: 'R', position: '3B', balance: 'E', avoidSacBunt: false, hitAndRun: true, steal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: false, pinchRunForDont: false },
    
    // Bench players - available for PH
    { name: 'Chase, Hal', hand: 'R', position: '1B', balance: 'E', avoidSacBunt: false, hitAndRun: false, steal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    { name: "O'Leary, Charley", hand: 'R', position: '3B', balance: '1L', avoidSacBunt: false, hitAndRun: false, steal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: true, pinchRunForDont: false },
    { name: 'Washington, Claudell', hand: 'L', position: 'RF', balance: '3R', avoidSacBunt: false, hitAndRun: false, steal: false, dontPHvsLHP: false, dontPHvsRHP: false, avoidPHInBlowouts: false, rememberFor4DefSub: false, pinchRunForDont: false },
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
          <strong>Strategy Applied:</strong> Speed players (Gwynn, Suzuki, Gordon) set to steal/hit-and-run. Elite defenders (Rodriguez, Bowa, McGee) marked for defensive subs. Power hitters avoid sac bunts. Starters protected from pinch hitting in key matchups.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Hitters</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">B</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">P</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Bal.</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="Avoid Sac Bunt">Avoid<br/>Sac bunt</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="Hit & Run">Hit & run</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Steal</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="Don't PH for vs. LHP">Don't PH<br/>vs. LHP</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="Don't PH for vs. RHP">Don't PH<br/>vs. RHP</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="Avoid PH in blowouts">Avoid PH<br/>in blowouts</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="Remember for 4 def sub">Rem. 4 def sub</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300" title="PR for Don't">PR for<br/>Don't</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {preferences.map((pref, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">{pref.name}</td>
                  <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.hand}</td>
                  <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.position}</td>
                  <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.balance}</td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.avoidSacBunt}
                      onChange={() => togglePreference(index, 'avoidSacBunt')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.hitAndRun}
                      onChange={() => togglePreference(index, 'hitAndRun')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.steal}
                      onChange={() => togglePreference(index, 'steal')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.dontPHvsLHP}
                      onChange={() => togglePreference(index, 'dontPHvsLHP')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.dontPHvsRHP}
                      onChange={() => togglePreference(index, 'dontPHvsRHP')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.avoidPHInBlowouts}
                      onChange={() => togglePreference(index, 'avoidPHInBlowouts')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.rememberFor4DefSub}
                      onChange={() => togglePreference(index, 'rememberFor4DefSub')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={pref.pinchRunForDont}
                      onChange={() => togglePreference(index, 'pinchRunForDont')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
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
            <strong>Speed/Contact (Gwynn, Suzuki, Gordon):</strong> Aggressive baserunning enabled - steal, hit-and-run. Protected from PH vs favorable matchups.
          </div>
          <div>
            <strong>Elite Defenders (Rodriguez, Bowa, McGee, Chase, O'Leary):</strong> Marked for defensive substitutions in late innings.
          </div>
          <div>
            <strong>Power Hitters (Thomas):</strong> Avoid sac bunts to maximize run production.
          </div>
          <div>
            <strong>Backup Catcher (Killefer):</strong> Available for pinch running - Rodriguez too valuable defensively.
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
