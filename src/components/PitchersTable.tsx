import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Edit2, Trash2, UserPlus, Star } from 'lucide-react';
import type { PitcherWithStats } from '../types';
import { formatNumber, formatCurrency } from '../utils/calculations';

interface PitchersTableProps {
  pitchers: PitcherWithStats[];
  onEdit: (pitcher: PitcherWithStats) => void;
  onDelete: (id: string) => void;
  onAddToTeam?: (pitcher: PitcherWithStats) => void;
  onAddToWanted?: (pitcher: PitcherWithStats) => void;
}

type SortField = keyof PitcherWithStats;
type SortDirection = 'asc' | 'desc';

// Helper function to compare endurance ratings
// Returns: positive if a > b, 0 if equal, negative if a < b
function compareEndurance(a: string, b: string): number {
  if (!a || !b) return 0;
  
  // Extract type (S, R, C) and number
  const parseEndurance = (end: string) => {
    const match = end.match(/^([SRC])(\d+)(\+)?$/i);
    if (!match) return { type: '', num: 0, plus: false };
    return {
      type: match[1].toUpperCase(),
      num: parseInt(match[2]),
      plus: !!match[3]
    };
  };
  
  const endA = parseEndurance(a);
  const endB = parseEndurance(b);
  
  // Different types can't be compared (S vs R vs C)
  if (endA.type !== endB.type) return 0;
  
  // Compare numbers (higher is better: S9 > S8 > S7)
  if (endA.num !== endB.num) return endA.num - endB.num;
  
  // If numbers equal, + is better than no +
  if (endA.plus && !endB.plus) return 1;
  if (!endA.plus && endB.plus) return -1;
  
  return 0;
}

export function PitchersTable({ pitchers, onEdit, onDelete, onAddToTeam, onAddToWanted }: PitchersTableProps) {
  const [sortField, setSortField] = useState<SortField>('fantasyPoints');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [pitcherType, setPitcherType] = useState<'all' | 'starter' | 'reliever'>('all');
  const [throwingArm, setThrowingArm] = useState<'all' | 'L' | 'R'>('all');
  const [rosterFilter, setRosterFilter] = useState('');
  const [enduranceFilter, setEnduranceFilter] = useState<string>('all');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  
  const defaultWidths: Record<string, number> = {
    name: 180,
    season: 80,
    team: 80,
    salary: 100,
    endurance: 70,
    throwingArm: 50,
    games: 60,
    gamesStarted: 60,
    ip: 70,
    k: 60,
    bb: 60,
    h: 60,
    hr: 60,
    er: 60,
    fld: 80,
    hit: 60,
    balk: 60,
    wp: 60,
    hold: 60,
    bunt: 60,
    fp: 80,
    fpip: 80,
    fpgs: 80,
    fpdollar: 80,
    actions: 120,
  };

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pitchersTableColumnWidths');
    return saved ? JSON.parse(saved) : defaultWidths;
  });
  
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  
  useEffect(() => {
    localStorage.setItem('pitchersTableColumnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);
  
  useEffect(() => {
    if (!resizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [resizing.column]: newWidth }));
    };
    
    const handleMouseUp = () => {
      setResizing(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

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
  
  const getColumnWidth = (columnKey: string) => {
    const width = columnWidths[columnKey] || defaultWidths[columnKey] || 100;
    return `${width}px`;
  };
  
  const handleResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.target as HTMLElement).closest('th');
    if (th) {
      setResizing({
        column: columnKey,
        startX: e.clientX,
        startWidth: th.offsetWidth
      });
    }
  };
  
  const ResizeHandle = ({ columnKey }: { columnKey: string }) => (
    <div
      className="absolute right-0 top-0 h-full w-3 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none"
      onMouseDown={(e) => handleResizeStart(e, columnKey)}
      onClick={(e) => e.stopPropagation()}
      style={{ zIndex: 40 }}
    />
  );

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

    if (rosterFilter) {
      if (rosterFilter === 'FA') {
        filtered = filtered.filter((p) => !p.roster || p.roster === '');
      } else {
        filtered = filtered.filter((p) => p.roster === rosterFilter);
      }
    }

    if (minSalary) {
      const min = parseFloat(minSalary) * 1000;
      if (!isNaN(min)) {
        filtered = filtered.filter((p) => p.salary >= min);
      }
    }

    if (maxSalary) {
      const max = parseFloat(maxSalary) * 1000;
      if (!isNaN(max)) {
        filtered = filtered.filter((p) => p.salary <= max);
      }
    }

    if (enduranceFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const endurance = p.endurance?.toUpperCase() || '';
        return compareEndurance(endurance, enduranceFilter) >= 0;
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
  }, [pitchers, sortField, sortDirection, searchTerm, pitcherType, throwingArm, rosterFilter, enduranceFilter, minSalary, maxSalary]);

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
          value={rosterFilter}
          onChange={(e) => setRosterFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Rosters</option>
          <option value="FA">FA - Free Agents</option>
        </select>

        <select
          value={enduranceFilter}
          onChange={(e) => setEnduranceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Endurance</option>
          {uniqueEndurances.map(endurance => (
            <option key={endurance} value={endurance}>{endurance} or better</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min (e.g. 3000)"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          title="Enter salary in thousands (e.g., 3000 for $3M)"
        />

        <input
          type="number"
          placeholder="Max (e.g. 5000)"
          value={maxSalary}
          onChange={(e) => setMaxSalary(e.target.value)}
          className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          title="Enter salary in thousands (e.g., 5000 for $5M)"
        />
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto select-none">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-20">
            <tr>
              <th data-column-key="name" style={{ width: getColumnWidth('name'), minWidth: '120px' }} className="px-3 py-2 text-left sticky left-0 bg-gray-50 dark:bg-gray-800 z-30 relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="name" label="Name" />
                <ResizeHandle columnKey="name" />
              </th>
              <th data-column-key="season" style={{ width: getColumnWidth('season') }} className="px-3 py-2 text-left relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="season" label="Year" />
                <ResizeHandle columnKey="season" />
              </th>
              <th data-column-key="team" style={{ width: getColumnWidth('team') }} className="px-3 py-2 text-left relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="team" label="Team" />
                <ResizeHandle columnKey="team" />
              </th>
              <th data-column-key="roster" style={{ width: getColumnWidth('roster') }} className="px-3 py-2 text-left relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="roster" label="Roster" />
                <ResizeHandle columnKey="roster" />
              </th>
              <th data-column-key="salary" style={{ width: getColumnWidth('salary') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="salary" label="Salary" />
                <ResizeHandle columnKey="salary" />
              </th>
              <th data-column-key="endurance" style={{ width: getColumnWidth('endurance') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="endurance" label="End" />
                <ResizeHandle columnKey="endurance" />
              </th>
              <th data-column-key="throwingArm" style={{ width: getColumnWidth('throwingArm') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="throwingArm" label="T" />
                <ResizeHandle columnKey="throwingArm" />
              </th>
              <th data-column-key="games" style={{ width: getColumnWidth('games') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="games" label="G" />
                <ResizeHandle columnKey="games" />
              </th>
              <th data-column-key="gamesStarted" style={{ width: getColumnWidth('gamesStarted') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="gamesStarted" label="GS" />
                <ResizeHandle columnKey="gamesStarted" />
              </th>
              <th data-column-key="ip" style={{ width: getColumnWidth('ip') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="inningsPitched" label="IP" />
                <ResizeHandle columnKey="ip" />
              </th>
              <th data-column-key="k" style={{ width: getColumnWidth('k') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="strikeouts" label="K" />
                <ResizeHandle columnKey="k" />
              </th>
              <th data-column-key="bb" style={{ width: getColumnWidth('bb') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="walks" label="BB" />
                <ResizeHandle columnKey="bb" />
              </th>
              <th data-column-key="h" style={{ width: getColumnWidth('h') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="hitsAllowed" label="H" />
                <ResizeHandle columnKey="h" />
              </th>
              <th data-column-key="hr" style={{ width: getColumnWidth('hr') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="homeRunsAllowed" label="HR" />
                <ResizeHandle columnKey="hr" />
              </th>
              <th data-column-key="er" style={{ width: getColumnWidth('er') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="earnedRuns" label="ER" />
                <ResizeHandle columnKey="er" />
              </th>
              <th data-column-key="fld" style={{ width: getColumnWidth('fld') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="fieldingRange" label="Fld" />
                <ResizeHandle columnKey="fld" />
              </th>
              <th data-column-key="hit" style={{ width: getColumnWidth('hit') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="hitting" label="Hit" />
                <ResizeHandle columnKey="hit" />
              </th>
              <th data-column-key="balk" style={{ width: getColumnWidth('balk') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="balk" label="Balk" />
                <ResizeHandle columnKey="balk" />
              </th>
              <th data-column-key="wp" style={{ width: getColumnWidth('wp') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="wildPitch" label="WP" />
                <ResizeHandle columnKey="wp" />
              </th>
              <th data-column-key="hold" style={{ width: getColumnWidth('hold') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="hold" label="Hold" />
                <ResizeHandle columnKey="hold" />
              </th>
              <th data-column-key="bunt" style={{ width: getColumnWidth('bunt') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="bunting" label="Bunt" />
                <ResizeHandle columnKey="bunt" />
              </th>
              <th data-column-key="fp" style={{ width: getColumnWidth('fp') }} className="px-3 py-2 text-right font-semibold relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="fantasyPoints" label="FP" />
                <ResizeHandle columnKey="fp" />
              </th>
              <th data-column-key="fpip" style={{ width: getColumnWidth('fpip') }} className="px-3 py-2 text-right font-semibold relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="pointsPerIP" label="FP/IP" />
                <ResizeHandle columnKey="fpip" />
              </th>
              <th data-column-key="fpgs" style={{ width: getColumnWidth('fpgs') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="pointsPerStart" label="FP/GS" />
                <ResizeHandle columnKey="fpgs" />
              </th>
              <th data-column-key="fpdollar" style={{ width: getColumnWidth('fpdollar') }} className="px-3 py-2 text-right font-semibold relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="pointsPerDollar" label="FP/$" />
                <ResizeHandle columnKey="fpdollar" />
              </th>
              <th data-column-key="actions" style={{ width: getColumnWidth('actions') }} className="px-3 py-2 text-center relative">
                Actions
                <ResizeHandle columnKey="actions" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedPitchers.map((pitcher) => (
              <tr key={pitcher.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-900 z-10">{pitcher.name}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.season}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.team || '-'}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{pitcher.roster || 'FA'}</td>
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
                    {onAddToWanted && (
                      <button
                        onClick={() => onAddToWanted(pitcher)}
                        className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Add to Wanted List"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
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
