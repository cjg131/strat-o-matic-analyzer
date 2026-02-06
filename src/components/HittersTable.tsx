import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Edit2, Trash2, UserPlus, Star } from 'lucide-react';
import type { HitterWithStats } from '../types';
import { DebouncedNotesInput } from './DebouncedNotesInput';
import { formatNumber, formatCurrency } from '../utils/calculations';

interface HittersTableProps {
  hitters: HitterWithStats[];
  onEdit: (hitter: HitterWithStats) => void;
  onDelete: (id: string) => void;
  onAddToTeam?: (hitter: HitterWithStats) => void;
  onAddToWanted?: (hitter: HitterWithStats) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  showRoster?: boolean; // Show roster column and FA filter (default: false for pre-draft, true for season)
}

type SortField = keyof HitterWithStats;
type SortDirection = 'asc' | 'desc';

export function HittersTable({ hitters, onEdit, onDelete, onAddToTeam, onAddToWanted, onUpdateNotes, showRoster = false }: HittersTableProps) {
  const [sortField, setSortField] = useState<SortField>('fantasyPoints');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [rosterFilter, setRosterFilter] = useState('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [stlFilter, setStlFilter] = useState('');
  const [runFilter, setRunFilter] = useState('');
  const [rangeFilter, setRangeFilter] = useState('');
  const [armFilter, setArmFilter] = useState('');
  const [errorFilter, setErrorFilter] = useState('');
  const [tFilter, setTFilter] = useState('');
  
  const defaultWidths: Record<string, number> = {
    name: 180,
    season: 80,
    team: 80,
    roster: 80,
    positions: 100,
    salary: 100,
    balance: 60,
    stealRating: 60,
    runRating: 80,
    range: 100,
    arm: 80,
    error: 100,
    t: 100,
    games: 60,
    pa: 70,
    ab: 70,
    h: 60,
    ba: 70,
    obp: 70,
    slg: 70,
    singles: 60,
    doubles: 60,
    triples: 60,
    hr: 60,
    bb: 60,
    hbp: 60,
    sb: 60,
    cs: 60,
    fp: 80,
    fp600: 100,
    fpg: 80,
    fpdollar: 80,
    notes: 200,
    actions: 120,
  };

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('hittersTableColumnWidths');
    return saved ? JSON.parse(saved) : defaultWidths;
  });
  
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  
  useEffect(() => {
    localStorage.setItem('hittersTableColumnWidths', JSON.stringify(columnWidths));
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

    if (showRoster && rosterFilter) {
      if (rosterFilter === 'FA') {
        filtered = filtered.filter((h) => !h.roster || h.roster === '');
      } else {
        filtered = filtered.filter((h) => h.roster === rosterFilter);
      }
    }

    if (positionFilter) {
      filtered = filtered.filter((h) => {
        // Check both positions string and defensivePositions array
        let hasPosition = false;
        
        // Debug logging for OF filter
        if (positionFilter === 'OF') {
          console.log('[OF Filter Debug]', {
            name: h.name,
            positions: h.positions,
            defensivePositions: h.defensivePositions?.map(dp => dp.position)
          });
        }
        
        // Check positions string
        if (h.positions) {
          const posUpper = h.positions.toUpperCase();
          const filterUpper = positionFilter.toUpperCase();
          
          // If filtering by OF, match any outfield position (LF, CF, RF, or OF)
          if (positionFilter === 'OF') {
            hasPosition = posUpper.includes('LF') || posUpper.includes('CF') || posUpper.includes('RF') || posUpper.includes('OF');
            if (positionFilter === 'OF') {
              console.log('[OF Filter] String check:', { name: h.name, posUpper, hasPosition });
            }
          } else {
            // Use word boundary regex to match exact position (e.g., C won't match CF)
            const regex = new RegExp(`\\b${filterUpper}\\b`);
            hasPosition = regex.test(posUpper);
          }
        }
        
        // Also check defensivePositions array
        if (!hasPosition && h.defensivePositions && h.defensivePositions.length > 0) {
          const filterLower = positionFilter.toLowerCase();
          if (positionFilter === 'OF') {
            hasPosition = h.defensivePositions.some(dp => ['lf', 'cf', 'rf'].includes(dp.position.toLowerCase()));
            console.log('[OF Filter] Array check:', { name: h.name, positions: h.defensivePositions.map(dp => dp.position), hasPosition });
          } else {
            hasPosition = h.defensivePositions.some(dp => dp.position.toLowerCase() === filterLower);
          }
        }
        
        return hasPosition;
      });
    }

    if (minSalary) {
      const min = parseFloat(minSalary) * 1000;
      if (!isNaN(min)) {
        filtered = filtered.filter((h) => h.salary >= min);
      }
    }

    if (maxSalary) {
      const max = parseFloat(maxSalary) * 1000;
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

    // RUN rating filter: Show selected rating and better (higher second number is better, e.g., 1-17 is better than 1-15)
    if (runFilter && runFilter !== '') {
      const minRunValue = parseInt(runFilter);
      if (!isNaN(minRunValue)) {
        filtered = filtered.filter((h) => {
          if (!h.runRating) return false;
          const runRatingStr = String(h.runRating);
          const runMatch = runRatingStr.match(/(\d+)-(\d+)/);
          if (!runMatch) return false;
          const runSecondNumber = parseInt(runMatch[2]);
          return runSecondNumber >= minRunValue;
        });
      }
    }

    // Range filter: 1 is best, 5 is worst - show selected and better (lower numbers)
    if (rangeFilter && rangeFilter !== '') {
      const maxRange = parseInt(rangeFilter);
      if (!isNaN(maxRange)) {
        filtered = filtered.filter((h) => {
          if (!h.defensivePositions || h.defensivePositions.length === 0) return false;
          const positions = positionFilter 
            ? h.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
            : h.defensivePositions;
          return positions.some(dp => dp.range <= maxRange);
        });
      }
    }

    // Arm filter: -6 is best, +3 is worst - show selected and better (lower/more negative numbers)
    if (armFilter && armFilter !== '') {
      const maxArm = parseInt(armFilter);
      if (!isNaN(maxArm)) {
        filtered = filtered.filter((h) => {
          if (!h.defensivePositions || h.defensivePositions.length === 0) return false;
          const positions = positionFilter 
            ? h.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
            : h.defensivePositions;
          return positions.some(dp => dp.arm !== undefined && dp.arm <= maxArm);
        });
      }
    }

    // Error filter: Lower is better - show selected and better (lower numbers)
    if (errorFilter && errorFilter !== '') {
      const maxError = parseInt(errorFilter);
      if (!isNaN(maxError)) {
        filtered = filtered.filter((h) => {
          if (!h.defensivePositions || h.defensivePositions.length === 0) return false;
          const positions = positionFilter 
            ? h.defensivePositions.filter(dp => dp.position.toLowerCase() === positionFilter.toLowerCase())
            : h.defensivePositions;
          return positions.some(dp => dp.error <= maxError);
        });
      }
    }

    // T (Throwing) filter: For catchers only, lower first number is better
    if (tFilter && tFilter !== '') {
      const maxT = parseInt(tFilter);
      if (!isNaN(maxT)) {
        filtered = filtered.filter((h) => {
          if (!h.defensivePositions || h.defensivePositions.length === 0) return false;
          const catcherPositions = h.defensivePositions.filter(dp => dp.position.toLowerCase() === 'c');
          return catcherPositions.some(dp => {
            if (!dp.throwingRating) return false;
            const tMatch = dp.throwingRating.match(/T-(\d+)/);
            if (!tMatch) return false;
            const tValue = parseInt(tMatch[1]);
            return tValue <= maxT;
          });
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
  }, [hitters, searchTerm, positionFilter, rosterFilter, minSalary, maxSalary, sortField, sortDirection, stlFilter, runFilter, rangeFilter, armFilter, errorFilter, tFilter, showRoster]);

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
          {showRoster && (
            <div className="w-48">
              <select
                value={rosterFilter}
                onChange={(e) => setRosterFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Rosters</option>
                <option value="FA">FA - Free Agents</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center flex-wrap text-sm">
          <label className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Salary:</label>
          <input
            type="number"
            placeholder="Min (e.g. 3000)"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Enter salary in thousands (e.g., 3000 for $3M)"
          />
          <span className="text-gray-500 dark:text-gray-400 text-xs">to</span>
          <input
            type="number"
            placeholder="Max (e.g. 5000)"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Enter salary in thousands (e.g., 5000 for $5M)"
          />
          <select
            value={stlFilter}
            onChange={(e) => setStlFilter(e.target.value)}
            className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Range</option>
            <option value="1">1 and better</option>
            <option value="2">2 and better</option>
            <option value="3">3 and better</option>
            <option value="4">4 and better</option>
            <option value="5">5 and better</option>
          </select>
          <select
            value={armFilter}
            onChange={(e) => setArmFilter(e.target.value)}
            className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Arm</option>
            <option value="-6">-6 and better</option>
            <option value="-5">-5 and better</option>
            <option value="-4">-4 and better</option>
            <option value="-3">-3 and better</option>
            <option value="-2">-2 and better</option>
            <option value="-1">-1 and better</option>
            <option value="0">0 and better</option>
            <option value="1">+1 and better</option>
            <option value="2">+2 and better</option>
            <option value="3">+3 and better</option>
          </select>
          <select
            value={errorFilter}
            onChange={(e) => setErrorFilter(e.target.value)}
            className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Error</option>
            <option value="5">5 and better</option>
            <option value="10">10 and better</option>
            <option value="15">15 and better</option>
            <option value="20">20 and better</option>
            <option value="25">25 and better</option>
          </select>
          <select
            value={tFilter}
            onChange={(e) => setTFilter(e.target.value)}
            className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All T (C)</option>
            <option value="1">T-1 and better</option>
            <option value="2">T-2 and better</option>
            <option value="3">T-3 and better</option>
            <option value="4">T-4 and better</option>
            <option value="5">T-5 and better</option>
            <option value="6">T-6 and better</option>
            <option value="7">T-7 and better</option>
          </select>
          {(minSalary || maxSalary || stlFilter || runFilter || rangeFilter || armFilter || errorFilter || tFilter) && (
            <button
              onClick={() => {
                setMinSalary('');
                setMaxSalary('');
                setStlFilter('');
                setRunFilter('');
                setRangeFilter('');
                setArmFilter('');
                setErrorFilter('');
                setTFilter('');
              }}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
            >
              Clear All
            </button>
          )}
        </div>
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
              {showRoster && (
                <th data-column-key="roster" style={{ width: getColumnWidth('roster') }} className="px-3 py-2 text-left relative border-r border-gray-300 dark:border-gray-600">
                  <SortButton field="roster" label="Roster" />
                  <ResizeHandle columnKey="roster" />
                </th>
              )}
              <th data-column-key="positions" style={{ width: getColumnWidth('positions') }} className="px-3 py-2 text-left relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="positions" label="Pos" />
                <ResizeHandle columnKey="positions" />
              </th>
              <th data-column-key="salary" style={{ width: getColumnWidth('salary') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="salary" label="Salary" />
                <ResizeHandle columnKey="salary" />
              </th>
              <th data-column-key="balance" style={{ width: getColumnWidth('balance') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="balance" label="Bal" />
                <ResizeHandle columnKey="balance" />
              </th>
              <th data-column-key="stealRating" style={{ width: getColumnWidth('stealRating') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="stealRating" label="STL" />
                <ResizeHandle columnKey="stealRating" />
              </th>
              <th data-column-key="runRating" style={{ width: getColumnWidth('runRating') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="runRating" label="RUN" />
                <ResizeHandle columnKey="runRating" />
              </th>
              <th data-column-key="range" style={{ width: getColumnWidth('range') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                Range
                <ResizeHandle columnKey="range" />
              </th>
              <th data-column-key="arm" style={{ width: getColumnWidth('arm') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                Arm
                <ResizeHandle columnKey="arm" />
              </th>
              <th data-column-key="error" style={{ width: getColumnWidth('error') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                Error
                <ResizeHandle columnKey="error" />
              </th>
              <th data-column-key="t" style={{ width: getColumnWidth('t') }} className="px-3 py-2 text-center relative border-r border-gray-300 dark:border-gray-600">
                T
                <ResizeHandle columnKey="t" />
              </th>
              <th data-column-key="games" style={{ width: getColumnWidth('games') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="games" label="G" />
                <ResizeHandle columnKey="games" />
              </th>
              <th data-column-key="pa" style={{ width: getColumnWidth('pa') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="plateAppearances" label="PA" />
                <ResizeHandle columnKey="pa" />
              </th>
              <th data-column-key="ab" style={{ width: getColumnWidth('ab') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="ab" label="AB" />
                <ResizeHandle columnKey="ab" />
              </th>
              <th data-column-key="h" style={{ width: getColumnWidth('h') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="h" label="H" />
                <ResizeHandle columnKey="h" />
              </th>
              <th data-column-key="ba" style={{ width: getColumnWidth('ba') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="ba" label="BA" />
                <ResizeHandle columnKey="ba" />
              </th>
              <th data-column-key="obp" style={{ width: getColumnWidth('obp') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="obp" label="OBP" />
                <ResizeHandle columnKey="obp" />
              </th>
              <th data-column-key="slg" style={{ width: getColumnWidth('slg') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="slg" label="SLG" />
                <ResizeHandle columnKey="slg" />
              </th>
              <th data-column-key="singles" style={{ width: getColumnWidth('singles') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="singles" label="1B" />
                <ResizeHandle columnKey="singles" />
              </th>
              <th data-column-key="doubles" style={{ width: getColumnWidth('doubles') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="doubles" label="2B" />
                <ResizeHandle columnKey="doubles" />
              </th>
              <th data-column-key="triples" style={{ width: getColumnWidth('triples') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="triples" label="3B" />
                <ResizeHandle columnKey="triples" />
              </th>
              <th data-column-key="hr" style={{ width: getColumnWidth('hr') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="homeRuns" label="HR" />
                <ResizeHandle columnKey="hr" />
              </th>
              <th data-column-key="bb" style={{ width: getColumnWidth('bb') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="walks" label="BB" />
                <ResizeHandle columnKey="bb" />
              </th>
              <th data-column-key="hbp" style={{ width: getColumnWidth('hbp') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="hitByPitch" label="HBP" />
                <ResizeHandle columnKey="hbp" />
              </th>
              <th data-column-key="sb" style={{ width: getColumnWidth('sb') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="stolenBases" label="SB" />
                <ResizeHandle columnKey="sb" />
              </th>
              <th data-column-key="cs" style={{ width: getColumnWidth('cs') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="caughtStealing" label="CS" />
                <ResizeHandle columnKey="cs" />
              </th>
              <th data-column-key="fp" style={{ width: getColumnWidth('fp') }} className="px-3 py-2 text-right font-semibold relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="fantasyPoints" label="FP" />
                <ResizeHandle columnKey="fp" />
              </th>
              <th data-column-key="fp600" style={{ width: getColumnWidth('fp600') }} className="px-3 py-2 text-right font-semibold relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="pointsPer600PA" label="FP/600PA" />
                <ResizeHandle columnKey="fp600" />
              </th>
              <th data-column-key="fpg" style={{ width: getColumnWidth('fpg') }} className="px-3 py-2 text-right relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="pointsPerGame" label="FP/G" />
                <ResizeHandle columnKey="fpg" />
              </th>
              <th data-column-key="fpdollar" style={{ width: getColumnWidth('fpdollar') }} className="px-3 py-2 text-right font-semibold relative border-r border-gray-300 dark:border-gray-600">
                <SortButton field="pointsPerDollar" label="FP/$" />
                <ResizeHandle columnKey="fpdollar" />
              </th>
              <th data-column-key="notes" style={{ width: getColumnWidth('notes') }} className="px-3 py-2 text-left relative border-r border-gray-300 dark:border-gray-600">
                Notes
                <ResizeHandle columnKey="notes" />
              </th>
              <th data-column-key="actions" style={{ width: getColumnWidth('actions') }} className="px-3 py-2 text-center relative">
                Actions
                <ResizeHandle columnKey="actions" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedHitters.map((hitter) => (
              <tr key={hitter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-900 z-10">{hitter.name}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.season}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.team || '-'}</td>
                {showRoster && (
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{hitter.roster || 'FA'}</td>
                )}
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
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-semibold">{hitter.ba ? hitter.ba.toFixed(3) : '-'}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-semibold">{hitter.obp ? hitter.obp.toFixed(3) : '-'}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-semibold">{hitter.slg ? hitter.slg.toFixed(3) : '-'}</td>
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
                  {onUpdateNotes ? (
                    <DebouncedNotesInput
                      value={hitter.notes || ''}
                      onChange={(notes) => onUpdateNotes(hitter.id, notes)}
                      placeholder="Add notes..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{hitter.notes || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-2">
                    {onAddToWanted && (
                      <button
                        onClick={() => onAddToWanted(hitter)}
                        className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Add to Wanted List"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
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
