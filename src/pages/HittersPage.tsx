import { useState, useRef } from 'react';
import { Plus, Upload, Download, Trash2, RefreshCw } from 'lucide-react';
import { useHitters } from '../hooks/useHitters';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../contexts/AuthContext';
import { HittersTable } from '../components/HittersTable';
import { HitterForm } from '../components/HitterForm';
import { calculateHitterStats } from '../utils/calculations';
import { importHittersFromFile, exportHittersToExcel } from '../utils/importData';
import { saveRawImportData, getRawImportData } from '../services/firestore';
import { processHittersFromRawData } from '../utils/processRawData';
import type { Hitter, HitterWithStats, HitterScoringWeights } from '../types';

const HITTER_PRESETS: Record<string, { name: string; weights: HitterScoringWeights }> = {
  balanced: {
    name: 'Balanced',
    weights: { single: 2, double: 3, triple: 5, homeRun: 6, walk: 1, hitByPitch: 1, stolenBase: 2, caughtStealing: -1, stlRating: 3, runRating: 1.5, outPenalty: -0.3, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  power: {
    name: 'Power Hitting',
    weights: { single: 1, double: 4, triple: 7, homeRun: 10, walk: 0.5, hitByPitch: 0.5, stolenBase: 0.5, caughtStealing: -0.5, stlRating: 1, runRating: 0.5, outPenalty: -0.2, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  speed: {
    name: 'Speed & Base Running',
    weights: { single: 3, double: 4, triple: 6, homeRun: 5, walk: 1.5, hitByPitch: 1.5, stolenBase: 4, caughtStealing: -3, stlRating: 6, runRating: 3, outPenalty: -0.3, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  obp: {
    name: 'On-Base (OBP)',
    weights: { single: 3, double: 4, triple: 6, homeRun: 7, walk: 2.5, hitByPitch: 2.5, stolenBase: 1, caughtStealing: -1, stlRating: 2, runRating: 1, outPenalty: -0.5, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  contact: {
    name: 'Contact Hitting',
    weights: { single: 3, double: 4, triple: 5, homeRun: 6, walk: 1.5, hitByPitch: 1.5, stolenBase: 1.5, caughtStealing: -1, stlRating: 2, runRating: 1, outPenalty: -0.6, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 0, fieldingErrorPenalty: 0 }
  },
  defense: {
    name: 'Defense First',
    weights: { single: 2, double: 3, triple: 5, homeRun: 6, walk: 1, hitByPitch: 1, stolenBase: 2, caughtStealing: -1, stlRating: 3, runRating: 1.5, outPenalty: -0.3, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 3, fieldingErrorPenalty: -1 }
  },
  defenseSpeed: {
    name: 'Defense & Speed',
    weights: { single: 2.5, double: 3.5, triple: 5, homeRun: 5, walk: 1.5, hitByPitch: 1.5, stolenBase: 3, caughtStealing: -2, stlRating: 5, runRating: 2.5, outPenalty: -0.4, balanceVsRHP: 0, balanceVsLHP: 0, fieldingRangeBonus: 2, fieldingErrorPenalty: -0.75 }
  }
};

export function HittersPage() {
  const { hitters, addHitter, addMultipleHitters, updateHitter, deleteHitter, clearAllHitters } = useHitters();
  const { weights, updateWeights } = useScoringWeights();
  const { addHitter: addHitterToTeam } = useTeam();
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingHitter, setEditingHitter] = useState<Hitter | undefined>();
  const [importing, setImporting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [useNormalized, setUseNormalized] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hittersWithStats: HitterWithStats[] = hitters.map((hitter) => {
    const stats = calculateHitterStats(hitter, weights.hitter);
    
    if (useNormalized) {
      // Recalculate FP/G and FP/$ based on FP/600PA instead of total FP
      const normalizedFP = stats.pointsPer600PA;
      return {
        ...stats,
        pointsPerGame: hitter.games > 0 ? normalizedFP / hitter.games : 0,
        pointsPerDollar: hitter.salary > 0 ? (normalizedFP / (hitter.salary / 1000)) * 100 : 0,
      };
    }
    
    return stats;
  });

  const handleAdd = () => {
    setEditingHitter(undefined);
    setShowForm(true);
  };

  const handleEdit = (hitter: HitterWithStats) => {
    setEditingHitter(hitter);
    setShowForm(true);
  };

  const handleSubmit = (hitter: Hitter) => {
    if (editingHitter) {
      updateHitter(hitter.id, hitter);
    } else {
      addHitter(hitter);
    }
    setShowForm(false);
    setEditingHitter(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHitter(undefined);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    const hitter = hitters.find(h => h.id === id);
    if (hitter) {
      updateHitter(id, { ...hitter, notes });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hitter?')) {
      deleteHitter(id);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importHittersFromFile(file);
      
      if (result.success) {
        // Save raw data to Firestore for future re-processing
        if (currentUser && result.rawData) {
          await saveRawImportData(currentUser.uid, {
            id: 'hitters',
            type: 'hitters',
            filename: file.name,
            uploadDate: new Date().toISOString(),
            rowCount: result.rawData.length,
            rawData: result.rawData,
          });
        }

        // Use batch operation for faster, more reliable imports
        console.log(`[Import] Saving ${result.data.length} hitters in batches...`);
        await addMultipleHitters(result.data);
        
        const savedMsg = currentUser && result.rawData ? ' (Raw data saved for re-processing)' : '';
        alert(`Successfully imported ${result.data.length} hitter(s)${result.errors.length > 0 ? ` with ${result.errors.length} error(s)` : ''}${savedMsg}`);
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
        console.log(`✓ Import complete: ${result.data.length} hitters, raw data saved: ${!!result.rawData}`);
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

  const handleReprocess = async () => {
    if (!currentUser) {
      alert('You must be logged in to re-process data');
      return;
    }

    setReprocessing(true);
    try {
      console.log('[Re-process] Starting re-process operation...');
      const rawImport = await getRawImportData(currentUser.uid, 'hitters');
      
      if (!rawImport) {
        alert('No stored import data found. Please import a file first.');
        return;
      }

      console.log(`[Re-process] Retrieved ${rawImport.rawData.length} raw rows from storage`);
      
      // Re-process the raw data using current import logic
      console.log('[Re-process] Processing raw data...');
      const result = processHittersFromRawData(rawImport.rawData);
      console.log(`[Re-process] Processed ${result.data.length} hitters (${result.errors.length} errors)`);

      if (result.success) {
        // Clear existing hitters and add all re-processed hitters in batch
        console.log('[Re-process] Clearing existing hitters...');
        await clearAllHitters();
        
        console.log(`[Re-process] Saving ${result.data.length} hitters in batches of 500...`);
        await addMultipleHitters(result.data);
        
        console.log('[Re-process] ✓ Complete!');
        alert(`Successfully re-processed ${result.data.length} hitter(s) from stored data!`);
      } else {
        alert(`Re-process failed: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      console.error('[Re-process] Error:', err);
      alert(`Re-process failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setReprocessing(false);
    }
  };

  const handleExport = () => {
    if (hittersWithStats.length === 0) {
      alert('No hitters to export');
      return;
    }
    exportHittersToExcel(hittersWithStats);
  };

  const handleClearAll = () => {
    if (hitters.length === 0) {
      alert('No hitters to clear');
      return;
    }
    if (confirm(`Are you sure you want to delete all ${hitters.length} hitter(s)? This cannot be undone.`)) {
      hitters.forEach(hitter => deleteHitter(hitter.id));
      alert('All hitters cleared');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hitters
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage hitter statistics and view fantasy point calculations
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
            onClick={handleReprocess}
            disabled={reprocessing || !currentUser}
            className="flex items-center gap-2 px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
            title="Re-process stored data with latest import logic (check console for progress)"
          >
            <RefreshCw className={`h-5 w-5 ${reprocessing ? 'animate-spin' : ''}`} />
            {reprocessing ? 'Re-processing... (check console)' : 'Re-process'}
          </button>
          <button
            onClick={handleExport}
            disabled={hitters.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export Excel
          </button>
          <button
            onClick={handleClearAll}
            disabled={hitters.length === 0}
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
            Add Hitter
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingHitter ? 'Edit Hitter' : 'Add New Hitter'}
          </h2>
          <HitterForm
            hitter={editingHitter}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Hitter Scoring Weights</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Preset Strategy</label>
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                const preset = HITTER_PRESETS[e.target.value];
                if (preset) {
                  updateWeights({ ...weights, hitter: preset.weights });
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(HITTER_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Single (1B)</label>
            <input type="number" step="0.1" value={weights.hitter.single}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, single: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Double (2B)</label>
            <input type="number" step="0.1" value={weights.hitter.double}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, double: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Triple (3B)</label>
            <input type="number" step="0.1" value={weights.hitter.triple}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, triple: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Home Run (HR)</label>
            <input type="number" step="0.1" value={weights.hitter.homeRun}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, homeRun: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Walk (BB)</label>
            <input type="number" step="0.1" value={weights.hitter.walk}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, walk: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Hit By Pitch (HBP)</label>
            <input type="number" step="0.1" value={weights.hitter.hitByPitch}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, hitByPitch: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Stolen Base (SB)</label>
            <input type="number" step="0.1" value={weights.hitter.stolenBase}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, stolenBase: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Caught Stealing (CS)</label>
            <input type="number" step="0.1" value={weights.hitter.caughtStealing}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, caughtStealing: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">STL Rating (per level)</label>
            <input type="number" step="0.1" value={weights.hitter.stlRating}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, stlRating: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">RUN Rating (per level)</label>
            <input type="number" step="0.1" value={weights.hitter.runRating}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, runRating: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Out Penalty</label>
            <input type="number" step="0.1" value={weights.hitter.outPenalty}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, outPenalty: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Balance vs RHP (per level)</label>
            <input type="number" step="0.5" value={weights.hitter.balanceVsRHP}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, balanceVsRHP: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Balance vs LHP (per level)</label>
            <input type="number" step="0.5" value={weights.hitter.balanceVsLHP}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, balanceVsLHP: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Fielding Range Bonus (per level)</label>
            <input type="number" step="0.5" value={weights.hitter.fieldingRangeBonus}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, fieldingRangeBonus: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Fielding Error Penalty (per error)</label>
            <input type="number" step="0.5" value={weights.hitter.fieldingErrorPenalty}
              onChange={(e) => updateWeights({ ...weights, hitter: { ...weights.hitter, fieldingErrorPenalty: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Defensive Scoring:</strong> Range 1 (best) gets 5× bonus, Range 5 (worst) gets 1× bonus. Errors are negative (good) or positive (bad). Example: Range 2(-6) with Range Bonus=2 and Error Penalty=-0.5 gives (6-2)×2 + (-6)×(-0.5) = 8 + 3 = 11 defensive points.
          </p>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useNormalized}
              onChange={(e) => setUseNormalized(e.target.checked)}
              className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Calculate FP/G and FP/$ from FP/600PA (normalized)
            </span>
          </label>
        </div>
        <HittersTable
          hitters={hittersWithStats}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToTeam={addHitterToTeam}
          onUpdateNotes={handleUpdateNotes}
        />
      </div>
    </div>
  );
}
