import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useAuth } from '../contexts/AuthContext';
import { PitchersTable } from '../components/PitchersTable';
import { calculatePitcherStats } from '../utils/calculations';
import { importPitchersFromFile, exportPitchersToExcel } from '../utils/importData';
import { saveRawImportData } from '../services/firestore';
import type { PitcherWithStats } from '../types';

export function SeasonPitchersPage() {
  const { pitchers, addMultiplePitchers } = usePitchers();
  const { weights } = useScoringWeights();
  const { currentUser } = useAuth();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pitchersWithStats: PitcherWithStats[] = pitchers.map((pitcher) =>
    calculatePitcherStats(pitcher, weights.pitcher)
  );

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
        <PitchersTable
          pitchers={pitchersWithStats}
          onEdit={() => {}}
          onDelete={() => {}}
          showTeamColumn={true}
        />
      </div>
    </div>
  );
}
