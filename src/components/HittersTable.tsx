import { useState, useMemo } from 'react';
import { ArrowUpDown, Edit2, Trash2, UserPlus } from 'lucide-react';
import type { HitterWithStats } from '../types';
import { formatNumber, formatCurrency } from '../utils/calculations';

interface HittersTableProps {
  hitters: HitterWithStats[];
  onEdit: (hitter: HitterWithStats) => void;
  onDelete: (id: string) => void;
  onAddToTeam?: (hitter: HitterWithStats) => void;
}

type SortField = keyof HitterWithStats;
type SortDirection = 'asc' | 'desc';

export function HittersTable({ hitters, onEdit, onDelete, onAddToTeam }: HittersTableProps) {
  const [sortField, setSortField] = useState<SortField>('fantasyPoints');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [stlFilter, setStlFilter] = useState('');
  const [runFilter, setRunFilter] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedHitters = useMemo(() => {
    let filtered = hitters;

    if (searchTerm) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.season.includes(searchTerm)
      );
    }

    if (positionFilter) {
      filtered = filtered.filter((h) => {
        if (!h.positions) return false;
        const posUpper = h.positions.toUpperCase();
        const filterUpper = positionFilter.toUpperCase();
        
        // If filtering by OF, match any outfield position (LF, CF, RF, or OF)
        if (positionFilter === 'OF') {
          return posUpper.includes('LF') || posUpper.includes('CF') || posUpper.includes('RF') || posUpper.includes('OF');
        }
        
        // Use word boundary regex to match exact position (e.g., C won't match CF)
        const regex = new RegExp(`\\b${filterUpper}\\b`);
        return regex.test(posUpper);
      });
    }

    if (minSalary) {
      const min = parseFloat(minSalary);
      if (!isNaN(min)) {
        filtered = filtered.filter((h) => h.salary >= min);
      }
    }

    if (maxSalary) {
      const max = parseFloat(maxSalary);
      if (!isNaN(max)) {
        filtered = filtered.filter((h) => h.salary <= max);
      }
    }

    // STL rating filter: Show selected rating and better (AAA > AA > A > B > C > D > E)
    if (stlFilter && stlFilter !== '') {
      const stlMap: Record<string, number> = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'AA': 6, 'AAA': 7 };
      const minStlValue = stlMap[stlFilter] || 0;
      filtered = filtered.filter((h) => {
        if (!h.stealRating) return false;
        const stlRatingStr = String(h.stealRating).toUpperCase();
        const stlValue = stlMap[stlRatingStr] || 0;
        return stlValue >= minStlValue;
      });
    }

    // RUN rating filter: Show selected number and better (higher number is better)
    if (runFilter && runFilter !== '') {
      const minRunValue = parseInt(runFilter);
      if (!isNaN(minRunValue)) {
        filtered = filtered.filter((h) => {
          if (!h.runRating) return false;
          const runRatingStr = String(h.runRating);
          const runMatch = runRatingStr.match(/(\d+)-/);
          if (!runMatch) return false;
          const runValue = parseInt(runMatch[1]);
          return runValue >= minRunValue;
        });
      }
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
  }, [hitters, sortField, sortDirection, searchTerm, positionFilter, minSalary, maxSalary, stlFilter, runFilter]);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (hitters.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No hitters added yet. Click "Add Hitter" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search hitters by name, team, or season..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="w-48">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Positions</option>
              <option value="C">C - Catcher</option>
              <option value="1B">1B - First Base</option>
              <option value="2B">2B - Second Base</option>
              <option value="3B">3B - Third Base</option>
              <option value="SS">SS - Shortstop</option>
              <option value="LF">LF - Left Field</option>
              <option value="CF">CF - Center Field</option>
              <option value="RF">RF - Right Field</option>
              <option value="OF">OF - All Outfield</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Salary Range:
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {(minSalary || maxSalary) && (
            <button
              onClick={() => {
                setMinSalary('');
                setMaxSalary('');
              }}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear
            </button>
          )}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap ml-4">
            Speed Ratings:
          </label>
          <div className="flex gap-2 items-center">
            <select
              value={stlFilter}
              onChange={(e) => setStlFilter(e.target.value)}
              className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All STL</option>
              <option value="AAA">AAA and better</option>
              <option value="AA">AA and better</option>
              <option value="A">A and better</option>
              <option value="B">B and better</option>
              <option value="C">C and better</option>
              <option value="D">D and better</option>
              <option value="E">E and better</option>
            </select>
            <select
              value={runFilter}
              onChange={(e) => setRunFilter(e.target.value)}
              className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All RUN</option>
              <option value="17">1-17 and better</option>
              <option value="16">1-16 and better</option>
              <option value="15">1-15 and better</option>
              <option value="14">1-14 and better</option>
              <option value="13">1-13 and better</option>
              <option value="12">1-12 and better</option>
              <option value="11">1-11 and better</option>
              <option value="10">1-10 and better</option>
              <option value="9">1-9 and better</option>
              <option value="8">1-8 and better</option>
            </select>
          </div>
          {(stlFilter || runFilter) && (
            <button
              onClick={() => {
                setStlFilter('');
                setRunFilter('');
              }}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-20">
            <tr>
              <th className="px-3 py-2 text-left sticky left-0 bg-gray-50 dark:bg-gray-800 z-10"><SortButton field="name" label="Name" /></th>
              <th className="px-3 py-2 text-left"><SortButton field="season" label="Season" /></th>
              <th className="px-3 py-2 text-left"><SortButton field="team" label="Team" /></th>
              <th className="px-3 py-2 text-left"><SortButton field="positions" label="Pos" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="salary" label="Salary" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="balance" label="Bal" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="stealRating" label="STL" /></th>
              <th className="px-3 py-2 text-center"><SortButton field="runRating" label="RUN" /></th>
              <th className="px-3 py-2 text-center">Range</th>
              <th className="px-3 py-2 text-center">Arm</th>
              <th className="px-3 py-2 text-center">Error</th>
              <th className="px-3 py-2 text-center">T</th>
              <th className="px-3 py-2 text-right"><SortButton field="games" label="G" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="plateAppearances" label="PA" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="ab" label="AB" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="h" label="H" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="singles" label="1B" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="doubles" label="2B" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="triples" label="3B" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="homeRuns" label="HR" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="walks" label="BB" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="hitByPitch" label="HBP" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="stolenBases" label="SB" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="caughtStealing" label="CS" /></th>
              <th className="px-3 py-2 text-right font-semibold"><SortButton field="fantasyPoints" label="FP" /></th>
              <th className="px-3 py-2 text-right font-semibold"><SortButton field="pointsPer600PA" label="FP/600PA" /></th>
              <th className="px-3 py-2 text-right"><SortButton field="pointsPerGame" label="FP/G" /></th>
              <th className="px-3 py-2 text-right font-semibold"><SortButton field="pointsPerDollar" label="FP/$" /></th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedHitters.map((hitter) => (
              <tr key={hitter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-900 z-10">{hitter.name}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.season}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.team || '-'}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.positions || '-'}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">{formatCurrency(hitter.salary)}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{hitter.balance || 'E'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{hitter.stealRating || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-semibold">{hitter.runRating || '-'}</td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                  {(() => {
                    if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                    const positions = positionFilter 
                      ? hitter.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
                      : hitter.defensivePositions;
                    return positions.length > 0 
                      ? positions.map(dp => `${dp.position.toUpperCase()}: ${dp.range}`).join(' / ')
                      : '-';
                  })()}
                </td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                  {(() => {
                    if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                    const positions = positionFilter 
                      ? hitter.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
                      : hitter.defensivePositions;
                    return positions.length > 0 
                      ? positions.map(dp => dp.arm !== undefined ? (dp.arm >= 0 ? `+${dp.arm}` : `${dp.arm}`) : '-').join(' / ')
                      : '-';
                  })()}
                </td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                  {(() => {
                    if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                    const positions = positionFilter 
                      ? hitter.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
                      : hitter.defensivePositions;
                    return positions.length > 0 
                      ? positions.map(dp => `${dp.position.toUpperCase()}: ${dp.error}`).join(' / ')
                      : '-';
                  })()}
                </td>
                <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                  {(() => {
                    if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) return '-';
                    const positions = positionFilter 
                      ? hitter.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
                      : hitter.defensivePositions;
                    return positions.length > 0 
                      ? positions.map(dp => dp.throwingRating || '-').join(' / ')
                      : '-';
                  })()}
                </td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.games}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.plateAppearances}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.ab}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.h}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.singles}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.doubles}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.triples}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.homeRuns}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.walks}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.hitByPitch}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.stolenBases}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{hitter.caughtStealing}</td>
                <td className="px-3 py-2 text-right font-semibold text-primary-600 dark:text-primary-400">
                  {isNaN(hitter.fantasyPoints) || !isFinite(hitter.fantasyPoints) ? '-' : formatNumber(hitter.fantasyPoints, 0)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-primary-600 dark:text-primary-400">
                  {isNaN(hitter.pointsPer600PA) || !isFinite(hitter.pointsPer600PA) ? '-' : formatNumber(hitter.pointsPer600PA, 0)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                  {isNaN(hitter.pointsPerGame) || !isFinite(hitter.pointsPerGame) ? '-' : formatNumber(hitter.pointsPerGame, 2)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                  {isNaN(hitter.pointsPerDollar) || !isFinite(hitter.pointsPerDollar) ? '-' : formatNumber(hitter.pointsPerDollar, 2)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-2">
                    {onAddToTeam && (
                      <button
                        onClick={() => onAddToTeam(hitter)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Add to Team"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(hitter)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(hitter.id)}
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
        Showing {filteredAndSortedHitters.length} of {hitters.length} hitters
      </div>
    </div>
  );
}
