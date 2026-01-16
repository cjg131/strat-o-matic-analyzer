import { useState, useEffect } from 'react';
import type { Pitcher } from '../types';

interface PitcherFormProps {
  pitcher?: Pitcher;
  onSubmit: (pitcher: Pitcher) => void;
  onCancel: () => void;
}

export function PitcherForm({ pitcher, onSubmit, onCancel }: PitcherFormProps) {
  const [formData, setFormData] = useState<Pitcher>(
    pitcher || {
      id: crypto.randomUUID(),
      name: '',
      season: '',
      team: '',
      salary: 0,
      inningsPitched: 0,
      strikeouts: 0,
      walks: 0,
      hitsAllowed: 0,
      homeRunsAllowed: 0,
      earnedRuns: 0,
      games: 0,
      gamesStarted: 0,
      throwingArm: '',
      endurance: '',
      fieldingRange: 0,
      fieldingError: 0,
      hitting: '',
      balk: 0,
      wildPitch: 0,
      hold: 0,
      bunting: '',
    }
  );

  useEffect(() => {
    if (pitcher) {
      setFormData(pitcher);
    }
  }, [pitcher]);

  const handleChange = (field: keyof Pitcher, value: string | number) => {
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
            IP
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.inningsPitched}
            onChange={(e) => handleChange('inningsPitched', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            K
          </label>
          <input
            type="number"
            min="0"
            value={formData.strikeouts}
            onChange={(e) => handleChange('strikeouts', parseInt(e.target.value) || 0)}
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
            H
          </label>
          <input
            type="number"
            min="0"
            value={formData.hitsAllowed}
            onChange={(e) => handleChange('hitsAllowed', parseInt(e.target.value) || 0)}
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
            value={formData.homeRunsAllowed}
            onChange={(e) => handleChange('homeRunsAllowed', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ER
          </label>
          <input
            type="number"
            min="0"
            value={formData.earnedRuns}
            onChange={(e) => handleChange('earnedRuns', parseInt(e.target.value) || 0)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            GS
          </label>
          <input
            type="number"
            min="0"
            value={formData.gamesStarted}
            onChange={(e) => handleChange('gamesStarted', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Throws (L/R)
          </label>
          <input
            type="text"
            value={formData.throwingArm}
            onChange={(e) => handleChange('throwingArm', e.target.value.toUpperCase())}
            placeholder="R"
            maxLength={1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Endurance (e.g., S6, R2, C4)
          </label>
          <input
            type="text"
            value={formData.endurance}
            onChange={(e) => handleChange('endurance', e.target.value.toUpperCase())}
            placeholder="S6"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fielding Range (1-5)
          </label>
          <input
            type="number"
            min="0"
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
            Hitting (e.g., 3WR, 5NL)
          </label>
          <input
            type="text"
            value={formData.hitting}
            onChange={(e) => handleChange('hitting', e.target.value.toUpperCase())}
            placeholder="3WR"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Balk (lower is better)
          </label>
          <input
            type="number"
            min="0"
            value={formData.balk}
            onChange={(e) => handleChange('balk', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wild Pitch (lower is better)
          </label>
          <input
            type="number"
            min="0"
            value={formData.wildPitch}
            onChange={(e) => handleChange('wildPitch', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hold (-4 to +3)
          </label>
          <input
            type="number"
            min="-4"
            max="3"
            value={formData.hold}
            onChange={(e) => handleChange('hold', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bunting (A-D)
          </label>
          <input
            type="text"
            value={formData.bunting}
            onChange={(e) => handleChange('bunting', e.target.value.toUpperCase())}
            placeholder="A"
            maxLength={1}
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
          {pitcher ? 'Update' : 'Add'} Pitcher
        </button>
      </div>
    </form>
  );
}
