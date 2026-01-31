import { useState, useMemo } from 'react';
import { useHitters } from '../hooks/useHitters';

interface TeamStrategy {
  // Tendencies
  baseRunning: string;
  baseStealing: string;
  closerUsage: string;
  reliefUsage: string;
  bunting: string;
  hitAndRun: string;
  intentionalWalk: string;
  infieldIn: string;
  
  // Offensive subs
  pinchHitterVsLHP: string;
  pinchHitterVsRHP: string;
  pinchRunner: string;
  
  // Defensive subs
  defensiveReplacement1Player: string;
  defensiveReplacement1Position: string;
  defensiveReplacement2Player: string;
  defensiveReplacement2Position: string;
  defensiveReplacement3Player: string;
  defensiveReplacement3Position: string;
  defensiveReplacement4Player: string;
  defensiveReplacement4Position: string;
}

const USER_TEAM = 'Manhattan WOW Award Stars';

export function TeamStrategyPage() {
  const { hitters } = useHitters();
  
  // Build roster list from actual database hitters
  const roster = useMemo(() => {
    return hitters
      .filter(h => h.roster === USER_TEAM)
      .map(h => {
        const hand = h.balance?.includes('L') ? 'L' : h.balance?.includes('R') ? 'R' : 'S';
        const primaryPos = h.positions?.split(',')[0]?.trim() || 'DH';
        return `${h.name} (${hand}, ${primaryPos})`;
      })
      .sort();
  }, [hitters]);
  
  const [strategy, setStrategy] = useState<TeamStrategy>({
    // Tendencies - default balanced settings
    baseRunning: 'Normal',
    baseStealing: 'Normal',
    closerUsage: 'Regular',
    reliefUsage: 'Normal',
    bunting: 'Normal',
    hitAndRun: 'Normal',
    intentionalWalk: 'Normal',
    infieldIn: '3rd Inning',
    
    // Offensive subs - to be configured by user
    pinchHitterVsLHP: '',
    pinchHitterVsRHP: '',
    pinchRunner: '',
    
    // Defensive subs - to be configured by user
    defensiveReplacement1Player: '',
    defensiveReplacement1Position: '',
    defensiveReplacement2Player: '',
    defensiveReplacement2Position: '',
    defensiveReplacement3Player: '',
    defensiveReplacement3Position: '',
    defensiveReplacement4Player: '',
    defensiveReplacement4Position: '',
  });

  const updateStrategy = (field: keyof TeamStrategy, value: string) => {
    setStrategy(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const tendencyOptions = {
    baseRunning: ['Very Aggressive', 'Aggressive', 'Normal', 'Conservative', 'Extra Conservative'],
    baseStealing: ['Very Aggressive', 'Aggressive', 'Normal', 'Conservative', 'Extra Conservative'],
    closerUsage: ['Regular', 'Maximize'],
    reliefUsage: ['Aggressive', 'Normal', 'Conservative'],
    bunting: ['Very Aggressive', 'Aggressive', 'Normal', 'Conservative', 'Extra Conservative'],
    hitAndRun: ['Very Aggressive', 'Aggressive', 'Normal', 'Conservative', 'Extra Conservative'],
    intentionalWalk: ['Very Aggressive', 'Aggressive', 'Normal', 'Conservative', 'Extra Conservative'],
    infieldIn: ['1st Inning', '2nd Inning', '3rd Inning', '4th Inning', '5th Inning'],
  };

  const positionOptions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Team Strategy
        </h1>
      </div>

      {/* TENDENCIES SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
          <h2 className="text-xl font-bold text-white">Tendencies</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Base running</label>
              <select
                value={strategy.baseRunning}
                onChange={(e) => updateStrategy('baseRunning', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.baseRunning.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Base stealing</label>
              <select
                value={strategy.baseStealing}
                onChange={(e) => updateStrategy('baseStealing', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.baseStealing.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Closer usage</label>
              <select
                value={strategy.closerUsage}
                onChange={(e) => updateStrategy('closerUsage', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.closerUsage.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Relief usage</label>
              <select
                value={strategy.reliefUsage}
                onChange={(e) => updateStrategy('reliefUsage', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.reliefUsage.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Bunting</label>
              <select
                value={strategy.bunting}
                onChange={(e) => updateStrategy('bunting', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.bunting.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Hit and run</label>
              <select
                value={strategy.hitAndRun}
                onChange={(e) => updateStrategy('hitAndRun', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.hitAndRun.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Intentional walk</label>
              <select
                value={strategy.intentionalWalk}
                onChange={(e) => updateStrategy('intentionalWalk', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.intentionalWalk.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900 dark:text-white">Infield in</label>
              <select
                value={strategy.infieldIn}
                onChange={(e) => updateStrategy('infieldIn', e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tendencyOptions.infieldIn.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* OFFENSIVE SUBS SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
          <h2 className="text-xl font-bold text-white">Offensive subs</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-900 dark:text-white">Pinch hitter vs. LHP</label>
            <select
              value={strategy.pinchHitterVsLHP}
              onChange={(e) => updateStrategy('pinchHitterVsLHP', e.target.value)}
              className="w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-900 dark:text-white">Pinch hitter vs. RHP</label>
            <select
              value={strategy.pinchHitterVsRHP}
              onChange={(e) => updateStrategy('pinchHitterVsRHP', e.target.value)}
              className="w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-900 dark:text-white">Pinch runner</label>
            <select
              value={strategy.pinchRunner}
              onChange={(e) => updateStrategy('pinchRunner', e.target.value)}
              className="w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DEFENSIVE SUBS SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
          <h2 className="text-xl font-bold text-white">Defensive subs</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-900 dark:text-white w-64">Defensive replacement #1</label>
            <select
              value={strategy.defensiveReplacement1Player}
              onChange={(e) => updateStrategy('defensiveReplacement1Player', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">--- Select Player ---</option>
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
            <span className="text-gray-900 dark:text-white">at</span>
            <select
              value={strategy.defensiveReplacement1Position}
              onChange={(e) => updateStrategy('defensiveReplacement1Position', e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">---</option>
              {positionOptions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-900 dark:text-white w-64">Defensive replacement #2</label>
            <select
              value={strategy.defensiveReplacement2Player}
              onChange={(e) => updateStrategy('defensiveReplacement2Player', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">--- Select Player ---</option>
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
            <span className="text-gray-900 dark:text-white">at</span>
            <select
              value={strategy.defensiveReplacement2Position}
              onChange={(e) => updateStrategy('defensiveReplacement2Position', e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">---</option>
              {positionOptions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-900 dark:text-white w-64">Defensive replacement #3</label>
            <select
              value={strategy.defensiveReplacement3Player}
              onChange={(e) => updateStrategy('defensiveReplacement3Player', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">--- Select Player ---</option>
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
            <span className="text-gray-900 dark:text-white">at</span>
            <select
              value={strategy.defensiveReplacement3Position}
              onChange={(e) => updateStrategy('defensiveReplacement3Position', e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">---</option>
              {positionOptions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-900 dark:text-white w-64">Defensive replacement #4</label>
            <select
              value={strategy.defensiveReplacement4Player}
              onChange={(e) => updateStrategy('defensiveReplacement4Player', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">--- Select Player ---</option>
              {roster.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
            <span className="text-gray-900 dark:text-white">at</span>
            <select
              value={strategy.defensiveReplacement4Position}
              onChange={(e) => updateStrategy('defensiveReplacement4Position', e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">---</option>
              {positionOptions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-red-600 dark:text-red-400">
            I-# - indicates the player is currently injured (for # more day(s))
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Strategy Applied:</strong> Very Aggressive baserunning/stealing (7 AA stealers). Aggressive hit-and-run (elite contact: Gwynn .370, Suzuki .351). Platoon PH: Chase vs LHP (.290 BA), Washington vs RHP (.322 OBP). McGee as PR (AA steal). Defensive subs: Chase at 1B (AA range), O'Leary at 3B (1L balance), McGee at LF (elite CF defense) - upgrade defense late in games.
        </p>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
