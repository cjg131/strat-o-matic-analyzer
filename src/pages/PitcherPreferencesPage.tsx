import { useState } from 'react';

interface PitcherPreference {
  name: string;
  hand: string;
  endurance: string;
  balance: string;
  role: 'starter' | 'reliever';
  dontRelieveB4: string;
  hookQk: boolean;
  hookSlo: boolean;
  maxIPStart6ip: boolean;
  maxIPStart7ip: boolean;
  ibbLess: boolean;
  avoidLHB: boolean;
  avoidRHB: boolean;
  avoidBlowout: boolean;
  avoidUsing6th: boolean;
  avoidUsing7th: boolean;
  avoidUsing8th: boolean;
  maxIPRel1_2: boolean;
  maxIPRel2_3: boolean;
}

export function PitcherPreferencesPage() {
  const [preferences, setPreferences] = useState<PitcherPreference[]>([
    // STARTERS
    // Cooper - L, S8, E balance, ace (1.87 ERA)
    { name: 'Cooper, Wilbur', hand: 'L', endurance: 'S8', balance: 'E', role: 'starter', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: true, avoidUsing6th: false, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: false },
    // Clarkson - R, S9*, 1R balance, workhorse (2.76 ERA, 483 IP)
    { name: 'Clarkson, John', hand: 'R', endurance: 'S9*', balance: '1R', role: 'starter', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: true, avoidUsing6th: false, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: false },
    // Fraser - R, S9*, E balance, #4 starter (3.81 ERA)
    { name: 'Fraser, Chick', hand: 'R', endurance: 'S9*', balance: 'E', role: 'starter', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: true, avoidUsing6th: false, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: false },
    // Johnson - R, S8*, 1R balance, #2 starter (2.56 ERA, 366 IP)
    { name: 'Johnson, School Boy', hand: 'R', endurance: 'S8*', balance: '1R', role: 'starter', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: true, avoidUsing6th: false, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: false },
    
    // RELIEVERS
    // Drabowsky - R, R4, 9R balance, setup man (2.81 ERA)
    { name: 'Drabowsky, Moe', hand: 'R', endurance: 'R4', balance: '9R', role: 'reliever', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: false, avoidUsing6th: true, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: true },
    // Fisher - R, R2, 5R balance, middle relief (4.93 ERA)
    { name: 'Fisher, Brian', hand: 'R', endurance: 'R2', balance: '5R', role: 'reliever', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: false, avoidUsing6th: false, avoidUsing7th: true, avoidUsing8th: true, maxIPRel1_2: true, maxIPRel2_3: false },
    // Laroche - L, R2, 4R balance, LOOGY (5.57 ERA)
    { name: 'Laroche, Dave', hand: 'L', endurance: 'R2', balance: '4R', role: 'reliever', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: true, avoidBlowout: false, avoidUsing6th: false, avoidUsing7th: true, avoidUsing8th: true, maxIPRel1_2: true, maxIPRel2_3: false },
    // Mooney - L, R4, 6R balance, lefty specialist (5.47 ERA)
    { name: 'Mooney, Jim', hand: 'L', endurance: 'R4', balance: '6R', role: 'reliever', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: true, avoidBlowout: false, avoidUsing6th: false, avoidUsing7th: true, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: true },
    // Earnshaw - R, S8*/R4, E balance, swingman (4.44 ERA)
    { name: 'Earnshaw, George', hand: 'R', endurance: 'S8*/R4', balance: 'E', role: 'reliever', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: false, avoidUsing6th: true, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: false },
    // Thurston - R, S9*/R3, 2R balance, swingman (#5 starter, 3.80 ERA)
    { name: 'Thurston, Sloppy', hand: 'R', endurance: 'S9*/R3', balance: '2R', role: 'reliever', dontRelieveB4: '', hookQk: false, hookSlo: false, maxIPStart6ip: false, maxIPStart7ip: false, ibbLess: false, avoidLHB: false, avoidRHB: false, avoidBlowout: false, avoidUsing6th: true, avoidUsing7th: false, avoidUsing8th: false, maxIPRel1_2: false, maxIPRel2_3: false },
  ]);

  const togglePreference = (index: number, field: keyof PitcherPreference) => {
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

  const updateDontRelieveB4 = (index: number, value: string) => {
    const newPreferences = [...preferences];
    newPreferences[index] = {
      ...newPreferences[index],
      dontRelieveB4: value
    };
    setPreferences(newPreferences);
  };

  const starters = preferences.filter(p => p.role === 'starter');
  const relievers = preferences.filter(p => p.role === 'reliever');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pitcher Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Strategic pitching settings optimized for your staff
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Strategy Applied:</strong> Starters protected in blowouts. Best relievers (Drabowsky R4) avoid early use. Short relievers (Fisher R2, Laroche R2) limited to 1-2 IP. Lefty specialists (Laroche, Mooney) avoid RHB. Swingmen (Earnshaw, Thurston) can provide length.
        </p>
      </div>

      {/* STARTERS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
          <h2 className="text-xl font-bold text-white">Starters (only)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Starters (only)</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">End.</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Bal.</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Don't Rel. B4</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Hook</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Max IP/start</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">IBB<br/>less</th>
              </tr>
              <tr>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Qk</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Slo</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">6 ip</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">7 ip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {starters.map((pref, index) => {
                const actualIndex = preferences.findIndex(p => p.name === pref.name);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium border-r border-gray-200 dark:border-gray-700">{pref.name}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.hand}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.endurance}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{pref.balance}</td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <select 
                        value={pref.dontRelieveB4} 
                        onChange={(e) => updateDontRelieveB4(actualIndex, e.target.value)}
                        className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value=""></option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.hookQk} onChange={() => togglePreference(actualIndex, 'hookQk')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.hookSlo} onChange={() => togglePreference(actualIndex, 'hookSlo')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.maxIPStart6ip} onChange={() => togglePreference(actualIndex, 'maxIPStart6ip')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.maxIPStart7ip} onChange={() => togglePreference(actualIndex, 'maxIPStart7ip')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.ibbLess} onChange={() => togglePreference(actualIndex, 'ibbLess')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RELIEVERS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-700 px-6 py-3">
          <h2 className="text-xl font-bold text-white">Relievers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Relievers</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">T</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">End.</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Bal.</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Don't Rel. B4</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Hook</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Max IP/start</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">IBB<br/>less</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Avoid</th>
                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Avoid using<br/>Blowout</th>
                <th colSpan={3} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Avoid using</th>
                <th colSpan={2} className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Max IP/rel.</th>
              </tr>
              <tr>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Qk</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Slo</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">6 ip</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">7 ip</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">LHB</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">RHB</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">&lt;6th</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">&lt;7th</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">&lt;8th</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">1-2</th>
                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">2-3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {relievers.map((pref, index) => {
                const actualIndex = preferences.findIndex(p => p.name === pref.name);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium border-r border-gray-200 dark:border-gray-700">{pref.name}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.hand}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{pref.endurance}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{pref.balance}</td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <select 
                        value={pref.dontRelieveB4} 
                        onChange={(e) => updateDontRelieveB4(actualIndex, e.target.value)}
                        className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value=""></option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.hookQk} onChange={() => togglePreference(actualIndex, 'hookQk')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.hookSlo} onChange={() => togglePreference(actualIndex, 'hookSlo')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.maxIPStart6ip} onChange={() => togglePreference(actualIndex, 'maxIPStart6ip')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.maxIPStart7ip} onChange={() => togglePreference(actualIndex, 'maxIPStart7ip')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.ibbLess} onChange={() => togglePreference(actualIndex, 'ibbLess')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.avoidLHB} onChange={() => togglePreference(actualIndex, 'avoidLHB')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.avoidRHB} onChange={() => togglePreference(actualIndex, 'avoidRHB')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.avoidBlowout} onChange={() => togglePreference(actualIndex, 'avoidBlowout')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.avoidUsing6th} onChange={() => togglePreference(actualIndex, 'avoidUsing6th')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.avoidUsing7th} onChange={() => togglePreference(actualIndex, 'avoidUsing7th')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                      <input type="checkbox" checked={pref.avoidUsing8th} onChange={() => togglePreference(actualIndex, 'avoidUsing8th')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.maxIPRel1_2} onChange={() => togglePreference(actualIndex, 'maxIPRel1_2')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={pref.maxIPRel2_3} onChange={() => togglePreference(actualIndex, 'maxIPRel2_3')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Strategy Breakdown</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>Starters (Cooper, Clarkson, Fraser, Johnson):</strong> All protected in blowouts. S8+ endurance allows complete games. No IP limits - let them work deep.
          </div>
          <div>
            <strong>Elite Relievers (Drabowsky R4):</strong> Best ERA (2.81). Avoid using before 6th inning. Max 2-3 IP for multi-inning saves.
          </div>
          <div>
            <strong>Short Relievers (Fisher R2, Laroche R2):</strong> Limited endurance. Max 1-2 IP. Avoid using before 7th inning to preserve for late situations.
          </div>
          <div>
            <strong>Lefty Specialists (Laroche L, Mooney L):</strong> Set to avoid RHB - use primarily vs left-handed batters.
          </div>
          <div>
            <strong>Swingmen (Earnshaw S8*/R4, Thurston S9*/R3):</strong> Can start or relieve. Avoid using before 6th when relieving to provide length. No IP limits.
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
