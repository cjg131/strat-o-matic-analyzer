import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { AutoBuildStrategy, DEFAULT_STRATEGY } from '../utils/autoTeamBuilder';

interface AutoBuildModalProps {
  onClose: () => void;
  onBuild: (strategy: AutoBuildStrategy) => void;
}

export function AutoBuildModal({ onClose, onBuild }: AutoBuildModalProps) {
  const [strategy, setStrategy] = useState<AutoBuildStrategy>(DEFAULT_STRATEGY);

  const handleBuild = () => {
    onBuild(strategy);
    onClose();
  };

  const updateStrategy = (key: keyof AutoBuildStrategy, value: number) => {
    setStrategy((prev) => ({ ...prev, [key]: value }));
  };

  const presets = {
    balanced: {
      name: 'Balanced',
      strategy: DEFAULT_STRATEGY,
    },
    powerHitting: {
      name: 'Power Hitting',
      strategy: {
        ...DEFAULT_STRATEGY,
        powerWeight: 90,
        speedWeight: 20,
        defenseWeight: 30,
        hitterBudgetPercent: 65,
        pitcherBudgetPercent: 35,
      },
    },
    speedDefense: {
      name: 'Speed & Defense',
      strategy: {
        ...DEFAULT_STRATEGY,
        speedWeight: 90,
        defenseWeight: 85,
        powerWeight: 30,
        hitterBudgetPercent: 60,
        pitcherBudgetPercent: 40,
      },
    },
    pitchingFirst: {
      name: 'Pitching First',
      strategy: {
        ...DEFAULT_STRATEGY,
        starterWeight: 90,
        strikeoutWeight: 80,
        hitterBudgetPercent: 40,
        pitcherBudgetPercent: 60,
        targetPitchers: 12,
        targetCanStart: 7,
        targetCanRelieve: 5,
        targetPureRelievers: 4,
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auto Team Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Strategy Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setStrategy(preset.strategy)}
                  className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800 font-medium"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hitter Preferences</h3>
            <div className="space-y-4">
              <SliderControl
                label="Speed Priority"
                value={strategy.speedWeight}
                onChange={(v) => updateStrategy('speedWeight', v)}
                description="Favor stolen bases, triples, and speed"
              />
              <SliderControl
                label="Power Priority"
                value={strategy.powerWeight}
                onChange={(v) => updateStrategy('powerWeight', v)}
                description="Favor home runs and extra-base hits"
              />
              <SliderControl
                label="Defense Priority"
                value={strategy.defenseWeight}
                onChange={(v) => updateStrategy('defenseWeight', v)}
                description="Favor fielding range and low errors"
              />
              <SliderControl
                label="On-Base Priority"
                value={strategy.onBaseWeight}
                onChange={(v) => updateStrategy('onBaseWeight', v)}
                description="Favor walks and getting on base"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pitcher Preferences</h3>
            <div className="space-y-4">
              <SliderControl
                label="Starter Priority"
                value={strategy.starterWeight}
                onChange={(v) => updateStrategy('starterWeight', v)}
                description="Favor starting pitchers"
              />
              <SliderControl
                label="Reliever Priority"
                value={strategy.relieverWeight}
                onChange={(v) => updateStrategy('relieverWeight', v)}
                description="Favor relief pitchers"
              />
              <SliderControl
                label="Closer Priority"
                value={strategy.closerWeight}
                onChange={(v) => updateStrategy('closerWeight', v)}
                description="Favor closers specifically"
              />
              <SliderControl
                label="Strikeout Priority"
                value={strategy.strikeoutWeight}
                onChange={(v) => updateStrategy('strikeoutWeight', v)}
                description="Favor high strikeout pitchers"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Allocation</h3>
            <div className="space-y-4">
              <SliderControl
                label="Hitter Budget %"
                value={strategy.hitterBudgetPercent}
                onChange={(v) => {
                  updateStrategy('hitterBudgetPercent', v);
                  updateStrategy('pitcherBudgetPercent', 100 - v);
                }}
                description={`Allocate ${strategy.hitterBudgetPercent}% to hitters, ${strategy.pitcherBudgetPercent}% to pitchers`}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Roster Size</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Pitchers (10-12)
                </label>
                <input
                  type="number"
                  min="10"
                  max="12"
                  value={strategy.targetPitchers}
                  onChange={(e) => updateStrategy('targetPitchers', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Hitters (13-17)
                </label>
                <input
                  type="number"
                  min="13"
                  max="17"
                  value={strategy.targetHitters}
                  onChange={(e) => updateStrategy('targetHitters', parseInt(e.target.value) || 13)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Who can start (5+)
                </label>
                <input
                  type="number"
                  min="5"
                  max={strategy.targetPitchers}
                  value={strategy.targetCanStart}
                  onChange={(e) => updateStrategy('targetCanStart', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Who can relieve (4+)
                </label>
                <input
                  type="number"
                  min="4"
                  max={strategy.targetPitchers}
                  value={strategy.targetCanRelieve}
                  onChange={(e) => updateStrategy('targetCanRelieve', parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pure relievers (4+)
                </label>
                <input
                  type="number"
                  min="4"
                  max={strategy.targetPitchers}
                  value={strategy.targetPureRelievers}
                  onChange={(e) => updateStrategy('targetPureRelievers', parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleBuild}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Build Team
          </button>
        </div>
      </div>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description: string;
}

function SliderControl({ label, value, onChange, description }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  );
}
