import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { useHitters } from '../hooks/useHitters';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useAuth } from '../contexts/AuthContext';
import { HittersTable } from '../components/HittersTable';
import { calculateHitterStats } from '../utils/calculations';
import { importHittersFromFile, exportHittersToExcel } from '../utils/importData';
import { saveRawImportData } from '../services/firestore';
import type { HitterWithStats } from '../types';

export function SeasonHittersPage() {
  const { hitters, addMultipleHitters } = useHitters();
  const { weights } = useScoringWeights();
  const { currentUser } = useAuth();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hittersWithStats: HitterWithStats[] = hitters.map((hitter) =>
    calculateHitterStats(hitter, weights.hitter)
  );

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
        />
      </div>
    </div>
  );
}
