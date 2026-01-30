import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useAuth } from '../contexts/AuthContext';
import { useWantedPlayers } from '../hooks/useWantedPlayers';
import { PitchersTable } from '../components/PitchersTable';
import { calculatePitcherStats } from '../utils/calculations';
import { importPitchersFromFile, exportPitchersToExcel } from '../utils/importData';
import { saveRawImportData } from '../services/firestore';
import type { PitcherWithStats, PitcherScoringWeights } from '../types';

const PITCHER_PRESETS: Record<string, { name: string; weights: PitcherScoringWeights }> = {
  balanced: {
    name: 'Balanced',
    weights: { strikeout: 1, walkAllowed: -1, hitAllowed: -1, homeRunAllowed: -3, earnedRun: -2 }
  },
  strikeout: {
    name: 'Strikeout Pitcher',
    weights: { strikeout: 2, walkAllowed: -0.5, hitAllowed: -0.8, homeRunAllowed: -2, earnedRun: -1.5 }
  },
  control: {
    name: 'Control & Command',
    weights: { strikeout: 0.5, walkAllowed: -2, hitAllowed: -1.5, homeRunAllowed: -3, earnedRun: -2.5 }
  },
  groundball: {
    name: 'Ground Ball Pitcher',
    weights: { strikeout: 0.5, walkAllowed: -1, hitAllowed: -0.8, homeRunAllowed: -4, earnedRun: -2 }
  }
};

export function SeasonPitchersPage() {
  const { pitchers, addMultiplePitchers } = usePitchers();
  const { weights, updateWeights } = useScoringWeights();
  const { currentUser } = useAuth();
  const { addPlayer, isPlayerWanted } = useWantedPlayers();
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

  const handleAddToWanted = async (pitcher: PitcherWithStats) => {
    if (isPlayerWanted(pitcher.id)) {
      alert('This player is already on your wanted list');
      return;
    }

    try {
      await addPlayer({
        playerId: pitcher.id,
        playerName: pitcher.name,
        playerType: 'pitcher',
        season: pitcher.season,
        team: pitcher.team,
        roster: pitcher.roster,
        salary: pitcher.salary,
        fantasyPoints: pitcher.fantasyPoints,
      });
      alert(`Added ${pitcher.name} to wanted list`);
    } catch (error) {
      alert('Failed to add player to wanted list');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importPitchersFromFile(file);
      
      if (result.success) {
        if (currentUser && result.rawData) {
          await saveRawImportData(currentUser.uid, {
            id: 'season-pitchers',
            type: 'pitchers',
            filename: file.name,
            uploadDate: new Date().toISOString(),
            rowCount: result.rawData.length,
            rawData: result.rawData,
          });
        }

        await addMultiplePitchers(result.data);
        
        const savedMsg = currentUser && result.rawData ? ' (Raw data saved)' : '';
        alert(`Successfully imported ${result.data.length} pitcher(s)${result.errors.length > 0 ? ` with ${result.errors.length} error(s)` : ''}${savedMsg}`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Season Pitchers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View all drafted pitchers with their team assignments
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
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pitcher Scoring Weights</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Preset Strategy</label>
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                const preset = PITCHER_PRESETS[e.target.value];
                if (preset) {
                  updateWeights({ ...weights, pitcher: preset.weights });
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(PITCHER_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Strikeout (K)</label>
            <input type="number" step="0.1" value={weights.pitcher.strikeout}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, strikeout: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Walk Allowed (BB)</label>
            <input type="number" step="0.1" value={weights.pitcher.walkAllowed}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, walkAllowed: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Hit Allowed (H)</label>
            <input type="number" step="0.1" value={weights.pitcher.hitAllowed}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, hitAllowed: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Home Run Allowed (HR)</label>
            <input type="number" step="0.1" value={weights.pitcher.homeRunAllowed}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, homeRunAllowed: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Earned Run (ER)</label>
            <input type="number" step="0.1" value={weights.pitcher.earnedRun}
              onChange={(e) => updateWeights({ ...weights, pitcher: { ...weights.pitcher, earnedRun: parseFloat(e.target.value) || 0 }})}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
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
              Calculate FP/Start and FP/$ from FP/IP (normalized)
            </span>
          </label>
        </div>
        <PitchersTable
          pitchers={pitchersWithStats}
          onEdit={() => {}}
          onDelete={() => {}}
          showRoster={true}
          onAddToWanted={handleAddToWanted}
        />
      </div>
    </div>
  );
}
