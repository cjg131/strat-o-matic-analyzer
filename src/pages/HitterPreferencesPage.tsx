import { useState, useEffect, useMemo } from 'react';
import { useHitters } from '../hooks/useHitters';

interface HitterPreference {
  id: string;
  name: string;
  hand: string;
  position: string;
  balance: string;
  stealRating: string;
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

const USER_TEAM = 'Manhattan WOW Award Stars';

export function HitterPreferencesPage() {
  const { hitters } = useHitters();
  const [preferences, setPreferences] = useState<HitterPreference[]>([]);

  // Filter hitters by user's team and convert to preferences format
  const teamHitters = useMemo(() => {
    return hitters
      .filter(h => h.roster === USER_TEAM)
      .sort((a, b) => {
        // Sort by position order: C, 1B, 2B, 3B, SS, LF, CF, RF, DH
        const posOrder = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
        const aPos = a.positions.split(',')[0].trim();
        const bPos = b.positions.split(',')[0].trim();
        const aIdx = posOrder.indexOf(aPos);
        const bIdx = posOrder.indexOf(bPos);
        if (aIdx !== bIdx) return aIdx - bIdx;
        return a.name.localeCompare(b.name);
      });
  }, [hitters]);

  // Initialize preferences when team hitters change
  useEffect(() => {
    const newPreferences: HitterPreference[] = teamHitters.map(hitter => ({
      id: hitter.id,
      name: hitter.name,
      hand: getHandFromBalance(hitter.balance),
      position: hitter.positions.split(',')[0].trim(),
      balance: hitter.balance,
      stealRating: hitter.stealRating || 'E',
      avoidLHP: false,
      avoidRHP: false,
      moreSacBunt: false,
      dontSacBunt: false,
      moreHitAndRun: false,
      dontHitAndRun: false,
      moreSteal: false,
      dontSteal: false,
      dontPHvsLHP: false,
      dontPHvsRHP: false,
      avoidPHInBlowouts: false,
      rememberFor4DefSub: false,
      pinchRunForDont: false,
    }));
    setPreferences(newPreferences);
  }, [teamHitters]);

  // Helper to extract hand from balance (e.g., "1L" -> "L", "2R" -> "R", "E" -> "S")
  function getHandFromBalance(balance: string): string {
    if (balance.includes('L')) return 'L';
    if (balance.includes('R')) return 'R';
    return 'S'; // Switch hitter or even balance
  }

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
          <strong>Team:</strong> {USER_TEAM} • <strong>Hitters:</strong> {preferences.length} players loaded from your roster
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
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Strategy Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>AA/A Stealers:</strong> Consider enabling "More Steal" for elite base stealers with high success rates.
          </div>
          <div>
            <strong>B/C/D/E Stealers:</strong> Consider "Don't Steal" for poor base stealers to avoid caught stealing penalties.
          </div>
          <div>
            <strong>Power Hitters:</strong> Enable "Don't Sac Bunt" to maximize run production and avoid wasting power at-bats.
          </div>
          <div>
            <strong>Elite Defenders:</strong> Mark "Remember for Def Sub" to use them for late-inning defensive replacements with a lead.
          </div>
          <div>
            <strong>Starters:</strong> Enable "Avoid PH in Blowouts" to preserve health and avoid unnecessary injury risk.
          </div>
          <div>
            <strong>Weak Hitters:</strong> Mark "PR for Don't" if they're slow runners who should be pinch-run for in key situations.
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
