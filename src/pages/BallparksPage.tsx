import { useState, useRef, useMemo } from 'react';
import { Plus, Upload, Download, Trash2, ArrowUpDown } from 'lucide-react';
import { useBallparks } from '../hooks/useBallparks';
import { importBallparksFromFile, exportBallparksToExcel } from '../utils/importData';
import type { Ballpark } from '../types';

type BallparkWithRatings = Ballpark & {
  offenseRating: number;
  defenseRating: number;
  speedDefenseRating: number;
};

type SortField = keyof BallparkWithRatings;

export function BallparksPage() {
  const { ballparks, addMultipleBallparks, updateBallpark, deleteBallpark, clearAllBallparks } = useBallparks();
  const [importing, setImporting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ballparksWithRatings: BallparkWithRatings[] = useMemo(() => {
    return ballparks.map(park => {
      // Offense Rating: Higher singles + higher HRs (weighted 3x) = better for offense
      const offenseRating = (park.singlesLeft + park.singlesRight + (park.homeRunsLeft * 3) + (park.homeRunsRight * 3)) / 8;
      
      // Defense Rating: Lower singles + lower HRs (weighted 3x) = better for defense (pitchers)
      const defenseRating = ((42 - park.singlesLeft - park.singlesRight) + ((42 - park.homeRunsLeft - park.homeRunsRight) * 3)) / 8;
      
      // Speed/Defense Rating: Higher singles (speed) + lower HRs (weighted 3x for defense)
      const speedDefenseRating = ((park.singlesLeft + park.singlesRight) / 2) + (((42 - park.homeRunsLeft - park.homeRunsRight) * 3) / 2);
      
      return {
        ...park,
        offenseRating: Math.round(offenseRating * 10) / 10,
        defenseRating: Math.round(defenseRating * 10) / 10,
        speedDefenseRating: Math.round(speedDefenseRating * 10) / 10,
      };
    });
  }, [ballparks]);

  const sortedBallparks = useMemo(() => {
    return [...ballparksWithRatings].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [ballparksWithRatings, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importBallparksFromFile(file);
      
      if (result.success) {
        addMultipleBallparks(result.data);
        alert(`Successfully imported ${result.data.length} ballparks!`);
      } else {
        alert(`Import completed with errors:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      alert('Failed to import file. Please check the format and try again.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    if (ballparks.length === 0) {
      alert('No ballparks to export');
      return;
    }
    exportBallparksToExcel(ballparks);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all ballparks? This cannot be undone.')) {
      clearAllBallparks();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ballparks
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ballpark ratings range from 1-20 (1 = pitcher-friendly, 20 = hitter-friendly, 10 = neutral)
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strategic Rating Calculations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Offense Rating</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Formula:</strong> (1B LH + 1B RH + HR LH×3 + HR RH×3) ÷ 8
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Weighted average with HRs counting 3x more than singles. Higher values favor power and hitting teams.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Defense Rating</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Formula:</strong> [(42 - 1B LH - 1B RH) + (42 - HR LH - HR RH)×3] ÷ 8
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inverse of offense with HRs weighted 3x. Higher values favor pitching teams (parks that suppress HRs heavily).
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Speed/Defense Rating</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Formula:</strong> [(1B LH + 1B RH) ÷ 2] + [(42 - HR LH - HR RH)×3 ÷ 2]
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rewards high singles (speed) and heavily rewards low HRs (defense). Perfect for speed/defense strategy.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <button
            onClick={handleExport}
            disabled={ballparks.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            Export Excel
          </button>
          <button
            onClick={handleClearAll}
            disabled={ballparks.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            Clear All
          </button>
        </div>

        {ballparks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No ballparks added yet. Import an Excel file to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left"><SortButton field="name" label="Name" /></th>
                  <th className="px-3 py-2 text-left"><SortButton field="team" label="Team" /></th>
                  <th className="px-3 py-2 text-center"><SortButton field="singlesLeft" label="1B vs LH" /></th>
                  <th className="px-3 py-2 text-center"><SortButton field="singlesRight" label="1B vs RH" /></th>
                  <th className="px-3 py-2 text-center"><SortButton field="homeRunsLeft" label="HR vs LH" /></th>
                  <th className="px-3 py-2 text-center"><SortButton field="homeRunsRight" label="HR vs RH" /></th>
                  <th className="px-3 py-2 text-center font-semibold"><SortButton field="offenseRating" label="Offense" /></th>
                  <th className="px-3 py-2 text-center font-semibold"><SortButton field="defenseRating" label="Defense" /></th>
                  <th className="px-3 py-2 text-center font-semibold"><SortButton field="speedDefenseRating" label="Spd/Def" /></th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedBallparks.map((ballpark) => (
                  <tr key={ballpark.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">{ballpark.name}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{ballpark.team || '-'}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{ballpark.singlesLeft}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{ballpark.singlesRight}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{ballpark.homeRunsLeft}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{ballpark.homeRunsRight}</td>
                    <td className="px-3 py-2 text-center font-semibold text-green-600 dark:text-green-400">{ballpark.offenseRating}</td>
                    <td className="px-3 py-2 text-center font-semibold text-blue-600 dark:text-blue-400">{ballpark.defenseRating}</td>
                    <td className="px-3 py-2 text-center font-semibold text-purple-600 dark:text-purple-400">{ballpark.speedDefenseRating}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => deleteBallpark(ballpark.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
