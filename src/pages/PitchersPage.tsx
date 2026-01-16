import { useState, useRef } from 'react';
import { Plus, Upload, Download, Trash2 } from 'lucide-react';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useTeam } from '../hooks/useTeam';
import { PitchersTable } from '../components/PitchersTable';
import { PitcherForm } from '../components/PitcherForm';
import { calculatePitcherStats } from '../utils/calculations';
import { importPitchersFromFile, exportPitchersToExcel } from '../utils/importData';
import type { Pitcher, PitcherWithStats, PitcherScoringWeights } from '../types';

const PITCHER_PRESETS: Record<string, { name: string; weights: PitcherScoringWeights }> = {
  balanced: {
    name: 'Balanced',
    weights: { perInningPitched: 3, strikeout: 1, walkAllowed: -1, hitAllowed: -1, homeRunAllowed: -3, earnedRun: -2 }
  },
  strikeout: {
    name: 'Strikeout Pitcher',
    weights: { perInningPitched: 2, strikeout: 2, walkAllowed: -0.5, hitAllowed: -0.8, homeRunAllowed: -2, earnedRun: -1.5 }
  },
  control: {
    name: 'Control & Command',
    weights: { perInningPitched: 3, strikeout: 0.5, walkAllowed: -2, hitAllowed: -1.5, homeRunAllowed: -3, earnedRun: -2.5 }
  },
  groundball: {
    name: 'Ground Ball Pitcher',
    weights: { perInningPitched: 3.5, strikeout: 0.5, walkAllowed: -1, hitAllowed: -0.8, homeRunAllowed: -4, earnedRun: -2 }
  }
};

export function PitchersPage() {
  const { pitchers, addPitcher, updatePitcher, deletePitcher } = usePitchers();
  const { weights, updateWeights } = useScoringWeights();
  const { addPitcher: addPitcherToTeam } = useTeam();
  const [showForm, setShowForm] = useState(false);
  const [editingPitcher, setEditingPitcher] = useState<Pitcher | undefined>();
  const [importing, setImporting] = useState(false);
  const [useNormalized, setUseNormalized] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pitchersWithStats: PitcherWithStats[] = pitchers.map((pitcher) => {
    const stats = calculatePitcherStats(pitcher, weights.pitcher);
    
    if (useNormalized) {
      // Recalculate FP/Start and FP/$ based on FP/IP instead of total FP
      const normalizedFP = stats.pointsPerIP;
      return {
        ...stats,
        pointsPerStart: pitcher.gamesStarted > 0 ? normalizedFP / pitcher.gamesStarted : 0,
        pointsPerDollar: pitcher.salary > 0 ? (normalizedFP / (pitcher.salary / 1000)) * 100 : 0,
      };
    }
    
    return stats;
  });

  const handleAdd = () => {
    setEditingPitcher(undefined);
    setShowForm(true);
  };

  const handleEdit = (pitcher: PitcherWithStats) => {
    setEditingPitcher(pitcher);
    setShowForm(true);
  };

  const handleSubmit = (pitcher: Pitcher) => {
    if (editingPitcher) {
      updatePitcher(pitcher.id, pitcher);
    } else {
      addPitcher(pitcher);
    }
    setShowForm(false);
    setEditingPitcher(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPitcher(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pitcher?')) {
      deletePitcher(id);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importPitchersFromFile(file);
      
      if (result.success) {
        result.data.forEach(pitcher => addPitcher(pitcher));
        alert(`Successfully imported ${result.data.length} pitcher(s)${result.errors.length > 0 ? ` with ${result.errors.length} error(s)` : ''}`);
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
      } else {
        alert(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    if (pitchers.length === 0) {
      alert('No pitchers to export');
      return;
    }
    exportPitchersToExcel(pitchers);
  };

  const handleClearAll = () => {
    if (pitchers.length === 0) {
      alert('No pitchers to clear');
      return;
    }
    if (confirm(`Are you sure you want to delete all ${pitchers.length} pitcher(s)? This cannot be undone.`)) {
      pitchers.forEach(pitcher => deletePitcher(pitcher.id));
      alert('All pitchers cleared');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pitchers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage pitcher statistics and view fantasy point calculations
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <button
            onClick={handleExport}
            disabled={pitchers.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export Excel
          </button>
          <button
            onClick={handleClearAll}
            disabled={pitchers.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            Clear All
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            Add Pitcher
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingPitcher ? 'Edit Pitcher' : 'Add New Pitcher'}
          </h2>
          <PitcherForm
            pitcher={editingPitcher}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pitcher Scoring Weights</h3>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Fantasy Points Calculation Formula:</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
            FP = (IP × Per IP Weight) + (K × K Weight) + (BB × BB Weight) + (H × H Weight) + (HR × HR Weight) + (ER × ER Weight)
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            Current: FP = (IP × {weights.pitcher.perInningPitched}) + (K × {weights.pitcher.strikeout}) + (BB × {weights.pitcher.walkAllowed}) + (H × {weights.pitcher.hitAllowed}) + (HR × {weights.pitcher.homeRunAllowed}) + (ER × {weights.pitcher.earnedRun})
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Preset Strategy
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => {
              setSelectedPreset(e.target.value);
              const preset = PITCHER_PRESETS[e.target.value];
              if (preset) {
                updateWeights({ ...weights, pitcher: preset.weights });
              }
            }}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.entries(PITCHER_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Select a preset strategy to automatically apply appropriate weights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Per Inning Pitched</label>
            <input type="number" step="0.1" value={weights.pitcher.perInningPitched}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, perInningPitched: parseFloat(e.target.value) || 0 }})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strikeout (K)</label>
            <input type="number" step="0.1" value={weights.pitcher.strikeout}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, strikeout: parseFloat(e.target.value) || 0 }})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Walk Allowed (BB)</label>
            <input type="number" step="0.1" value={weights.pitcher.walkAllowed}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, walkAllowed: parseFloat(e.target.value) || 0 }})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hit Allowed (H)</label>
            <input type="number" step="0.1" value={weights.pitcher.hitAllowed}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, hitAllowed: parseFloat(e.target.value) || 0 }})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Run Allowed (HR)</label>
            <input type="number" step="0.1" value={weights.pitcher.homeRunAllowed}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, homeRunAllowed: parseFloat(e.target.value) || 0 }})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Earned Run (ER)</label>
            <input type="number" step="0.1" value={weights.pitcher.earnedRun}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, earnedRun: parseFloat(e.target.value) || 0 }})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useNormalized}
              onChange={(e) => setUseNormalized(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Calculate FP/Start and FP/$ from FP/IP (normalized)
            </span>
          </label>
        </div>
        <PitchersTable
          pitchers={pitchersWithStats}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToTeam={addPitcherToTeam}
        />
      </div>
    </div>
  );
}
