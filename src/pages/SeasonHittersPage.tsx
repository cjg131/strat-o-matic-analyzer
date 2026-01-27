import { useState, useRef } from 'react';
import { Upload, Download, RefreshCw } from 'lucide-react';
import { useHitters } from '../hooks/useHitters';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useAuth } from '../contexts/AuthContext';
import { useWantedPlayers } from '../hooks/useWantedPlayers';
import { HittersTable } from '../components/HittersTable';
import { calculateHitterStats } from '../utils/calculations';
import { importHittersFromFile, exportHittersToExcel } from '../utils/importData';
import { saveRawImportData } from '../services/firestore';
import { assignRosterToPlayer } from '../utils/rosterAssignment';
import type { HitterWithStats } from '../types';

export function SeasonHittersPage() {
  const { hitters, addMultipleHitters, updateHitter } = useHitters();
  const { weights } = useScoringWeights();
  const { currentUser } = useAuth();
  const { addPlayer, isPlayerWanted } = useWantedPlayers();
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hittersWithStats: HitterWithStats[] = hitters.map((hitter) =>
    calculateHitterStats(hitter, weights.hitter)
  );

  const handleAddToWanted = async (hitter: HitterWithStats) => {
    if (isPlayerWanted(hitter.id)) {
      alert('This player is already on your wanted list');
      return;
    }

    try {
      await addPlayer({
        playerId: hitter.id,
        playerName: hitter.name,
        playerType: 'hitter',
        season: hitter.season,
        team: hitter.team,
        roster: hitter.roster,
        salary: hitter.salary,
        positions: hitter.positions,
        fantasyPoints: hitter.fantasyPoints,
      });
      alert(`Added ${hitter.name} to wanted list`);
    } catch (error) {
      alert('Failed to add player to wanted list');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importHittersFromFile(file);
      
      if (result.success) {
        if (currentUser && result.rawData) {
          await saveRawImportData(currentUser.uid, {
            id: 'season-hitters',
            type: 'hitters',
            filename: file.name,
            uploadDate: new Date().toISOString(),
            rowCount: result.rawData.length,
            rawData: result.rawData,
          });
        }

        await addMultipleHitters(result.data);
        
        const savedMsg = currentUser && result.rawData ? ' (Raw data saved)' : '';
        alert(`Successfully imported ${result.data.length} hitter(s)${result.errors.length > 0 ? ` with ${result.errors.length} error(s)` : ''}${savedMsg}`);
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

  const handleSyncRosters = async () => {
    if (!currentUser) {
      alert('You must be logged in to sync rosters');
      return;
    }

    if (!confirm('This will update all hitter rosters based on roster-assignments.json. Continue?')) {
      return;
    }

    setSyncing(true);
    try {
      let updatedCount = 0;
      
      for (const hitter of hitters) {
        const assignedRoster = assignRosterToPlayer(hitter.name, hitter.season);
        const newRoster = assignedRoster || '';
        
        // Only update if roster changed
        if (hitter.roster !== newRoster) {
          await updateHitter(hitter.id, { ...hitter, roster: newRoster });
          updatedCount++;
        }
      }
      
      alert(`Successfully synced rosters! Updated ${updatedCount} hitter(s).`);
    } catch (err) {
      alert(`Failed to sync rosters: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    if (hittersWithStats.length === 0) {
      alert('No hitters to export');
      return;
    }
    exportHittersToExcel(hittersWithStats);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Season Hitters
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View all drafted hitters with their team assignments
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
            onClick={handleSyncRosters}
            disabled={syncing || hitters.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className="h-5 w-5" />
            {syncing ? 'Syncing...' : 'Sync Rosters'}
          </button>
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
            disabled={hitters.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <HittersTable
          hitters={hittersWithStats}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddToWanted={handleAddToWanted}
        />
      </div>
    </div>
  );
}
