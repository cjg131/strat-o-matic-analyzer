import { useState, useEffect } from 'react';
import type { Hitter } from '../types';

interface HitterFormProps {
  hitter?: Hitter;
  onSubmit: (hitter: Hitter) => void;
  onCancel: () => void;
}

export function HitterForm({ hitter, onSubmit, onCancel }: HitterFormProps) {
  const [formData, setFormData] = useState<Hitter>(
    hitter || {
      id: crypto.randomUUID(),
      name: '',
      season: '',
      team: '',
      positions: '',
      defensivePositions: [],
      salary: 0,
      balance: 'E',
      fieldingRange: 0,
      fieldingError: 0,
      ab: 0,
      h: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      hitByPitch: 0,
      stolenBases: 0,
      caughtStealing: 0,
      plateAppearances: 0,
      games: 0,
    }
  );

  useEffect(() => {
    if (hitter) {
      setFormData(hitter);
    }
  }, [hitter]);

  const handleChange = (field: keyof Hitter, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Season *
          </label>
          <input
            type="text"
            required
            value={formData.season}
            onChange={(e) => handleChange('season', e.target.value)}
            placeholder="e.g., 1994"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team
          </label>
          <input
            type="text"
            value={formData.team || ''}
            onChange={(e) => handleChange('team', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Positions
          </label>
          <input
            type="text"
            value={formData.positions}
            onChange={(e) => handleChange('positions', e.target.value)}
            placeholder="e.g., 1B, OF, C-1B"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Salary *
          </label>
          <input
            type="number"
            required
            step="0.1"
            min="0"
            value={formData.salary}
            onChange={(e) => handleChange('salary', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Balance (vs Pitchers)
          </label>
          <select
            value={formData.balance}
            onChange={(e) => handleChange('balance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="9R">9R - Supremely better vs RHP</option>
            <option value="8R">8R</option>
            <option value="7R">7R</option>
            <option value="6R">6R</option>
            <option value="5R">5R</option>
            <option value="4R">4R</option>
            <option value="3R">3R</option>
            <option value="2R">2R</option>
            <option value="1R">1R - Mildly better vs RHP</option>
            <option value="E">E - Even</option>
            <option value="1L">1L - Mildly better vs LHP</option>
            <option value="2L">2L</option>
            <option value="3L">3L</option>
            <option value="4L">4L</option>
            <option value="5L">5L</option>
            <option value="6L">6L</option>
            <option value="7L">7L</option>
            <option value="8L">8L</option>
            <option value="9L">9L - Much better vs LHP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fielding Range (1-5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={formData.fieldingRange}
            onChange={(e) => handleChange('fieldingRange', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fielding Error
          </label>
          <input
            type="number"
            value={formData.fieldingError}
            onChange={(e) => handleChange('fieldingError', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            AB
          </label>
          <input
            type="number"
            min="0"
            value={formData.ab}
            onChange={(e) => handleChange('ab', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            H
          </label>
          <input
            type="number"
            min="0"
            value={formData.h}
            onChange={(e) => handleChange('h', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            2B
          </label>
          <input
            type="number"
            min="0"
            value={formData.doubles}
            onChange={(e) => handleChange('doubles', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            3B
          </label>
          <input
            type="number"
            min="0"
            value={formData.triples}
            onChange={(e) => handleChange('triples', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            HR
          </label>
          <input
            type="number"
            min="0"
            value={formData.homeRuns}
            onChange={(e) => handleChange('homeRuns', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            BB
          </label>
          <input
            type="number"
            min="0"
            value={formData.walks}
            onChange={(e) => handleChange('walks', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            HBP
          </label>
          <input
            type="number"
            min="0"
            value={formData.hitByPitch}
            onChange={(e) => handleChange('hitByPitch', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            SB
          </label>
          <input
            type="number"
            min="0"
            value={formData.stolenBases}
            onChange={(e) => handleChange('stolenBases', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CS
          </label>
          <input
            type="number"
            min="0"
            value={formData.caughtStealing}
            onChange={(e) => handleChange('caughtStealing', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            PA
          </label>
          <input
            type="number"
            min="0"
            value={formData.plateAppearances}
            onChange={(e) => handleChange('plateAppearances', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Games
          </label>
          <input
            type="number"
            min="0"
            value={formData.games}
            onChange={(e) => handleChange('games', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {hitter ? 'Update' : 'Add'} Hitter
        </button>
      </div>
    </form>
  );
}
