import { useState, useMemo } from 'react';
import { ArrowUpDown, Edit2, Trash2, UserPlus } from 'lucide-react';
import type { PitcherWithStats } from '../types';
import { formatNumber, formatCurrency } from '../utils/calculations';

interface PitchersTableProps {
  pitchers: PitcherWithStats[];
  onEdit: (pitcher: PitcherWithStats) => void;
  onDelete: (id: string) => void;
  onAddToTeam?: (pitcher: PitcherWithStats) => void;
}

type SortField = keyof PitcherWithStats;
type SortDirection = 'asc' | 'desc';

export function PitchersTable({ pitchers, onEdit, onDelete, onAddToTeam }: PitchersTableProps) {
  const [sortField, setSortField] = useState<SortField>('fantasyPoints');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [pitcherType, setPitcherType] = useState<'all' | 'starter' | 'reliever'>('all');
  const [throwingArm, setThrowingArm] = useState<'all' | 'L' | 'R'>('all');
  const [enduranceFilter, setEnduranceFilter] = useState<string>('all');

  // Extract unique endurance values
  const uniqueEndurances = useMemo(() => {
    const endurances = new Set<string>();
    pitchers.forEach(p => {
      if (p.endurance) {
        endurances.add(p.endurance.toUpperCase());
      }
    });
    return Array.from(endurances).sort();
  }, [pitchers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedPitchers = useMemo(() => {
    let filtered = pitchers;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.season.includes(searchTerm)
      );
    }

    if (pitcherType !== 'all') {
      filtered = filtered.filter((p) => {
        const endurance = p.endurance?.toUpperCase() || '';
        if (pitcherType === 'starter') {
          return endurance.startsWith('S');
        } else if (pitcherType === 'reliever') {
          return endurance.startsWith('R') || endurance.startsWith('C');
        }
        return true;
      });
    }

    if (throwingArm !== 'all') {
      filtered = filtered.filter((p) => {
        const arm = p.throwingArm?.toUpperCase() || '';
        return arm === throwingArm;
      });
    }

    if (enduranceFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const endurance = p.endurance?.toUpperCase() || '';
        return endurance === enduranceFilter;
      });
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [pitchers, sortField, sortDirection, searchTerm, pitcherType, throwingArm, enduranceFilter]);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (pitchers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No pitchers added yet. Click "Add Pitcher" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by name, team, or season..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        
        <select
          value={pitcherType}
          onChange={(e) => setPitcherType(e.target.value as 'all' | 'starter' | 'reliever')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Pitchers</option>
          <option value="starter">Starters Only</option>
          <option value="reliever">Relievers Only</option>
        </select>

        <select
          value={throwingArm}
          onChange={(e) => setThrowingArm(e.target.value as 'all' | 'L' | 'R')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Arms</option>
          <option value="L">Left-Handed</option>
          <option value="R">Right-Handed</option>
        </select>

        <select
          value={enduranceFilter}
          onChange={(e) => setEnduranceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Endurance</option>
          {uniqueEndurances.map(endurance => (
            <option key={endurance} value={endurance}>{endurance}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-20">
            <tr>
              <th className="px-3 py-2 text-left sticky left-0 bg-gray-50 dark:bg-gray-800 z-30"><SortButton field="name" label="Name" /></th>
              <th className="px-3 py-2 text-left"><SortButton field="season" label="Season" /></th>
              <th className="px-3 py-2 text-left"><SortButton field="team" label="Team" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="salary" label="Salary" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="endurance" label="End" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="throwingArm" label="T" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="games" label="G" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="gamesStarted" label="GS" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="inningsPitched" label="IP" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="strikeouts" label="K" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="walks" label="BB" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="hitsAllowed" label="H" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="homeRunsAllowed" label="HR" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="earnedRuns" label="ER" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="fieldingRange" label="Fld" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="hitting" label="Hit" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="balk" label="Balk" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="wildPitch" label="WP" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="hold" label="Hold" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="bunting" label="Bunt" /></th>
              <th className="px-3 py-2 text-right font-semibold"><SortButton field="fantasyPoints" label="FP" /></th>
              <th className="px-3 py-2 text-right font-semibold"><SortButton field="pointsPerIP" label="FP/IP" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="pointsPerStart" label="FP/GS" /></th>
              <th className="px-3 py-2 text-right font-semibold"><SortButton field="pointsPerDollar" label="FP/$" /></th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedPitchers.map((pitcher) => (
              <tr key={pitcher.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-900 z-10">{pitcher.name}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.season}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.team || '-'}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">{formatCurrency(pitcher.salary)}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.endurance || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{pitcher.throwingArm || '-'}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.games}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.gamesStarted}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatNumber(pitcher.inningsPitched, 1)}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.strikeouts}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.walks}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.hitsAllowed}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.homeRunsAllowed}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{pitcher.earnedRuns}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                  {pitcher.fieldingRange ? `${pitcher.fieldingRange}(${pitcher.fieldingError >= 0 ? '+' : ''}${pitcher.fieldingError})` : '-'}
                </td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hitting || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.balk || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.wildPitch || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.hold || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{pitcher.bunting || '-'}</td>
                <td className="px-3 py-2 text-right font-semibold text-primary-600 dark:text-primary-400">
                  {isNaN(pitcher.fantasyPoints) || !isFinite(pitcher.fantasyPoints) ? '-' : formatNumber(pitcher.fantasyPoints, 0)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-primary-600 dark:text-primary-400">
                  {isNaN(pitcher.pointsPerIP) || !isFinite(pitcher.pointsPerIP) ? '-' : formatNumber(pitcher.pointsPerIP, 0)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                  {isNaN(pitcher.pointsPerStart) || !isFinite(pitcher.pointsPerStart) ? '-' : formatNumber(pitcher.pointsPerStart, 2)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                  {isNaN(pitcher.pointsPerDollar) || !isFinite(pitcher.pointsPerDollar) ? '-' : formatNumber(pitcher.pointsPerDollar, 2)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-2">
                    {onAddToTeam && (
                      <button
                        onClick={() => onAddToTeam(pitcher)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Add to Team"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(pitcher)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(pitcher.id)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedPitchers.length} of {pitchers.length} pitchers
      </div>
    </div>
  );
}
