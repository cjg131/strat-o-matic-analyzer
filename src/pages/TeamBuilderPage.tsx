import { useState } from 'react';
import { Users, Trash2, DollarSign, AlertCircle, Zap, Plus, Copy } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useBallparks } from '../hooks/useBallparks';
import { DEFAULT_ROSTER_REQUIREMENTS } from '../types';
import { formatCurrency, calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import { autoSelectTeam, AutoBuildStrategy } from '../utils/autoTeamBuilder';
import { AutoBuildModal } from '../components/AutoBuildModal';
import { TeamRosterTable } from '../components/TeamRosterTable';
import { checkPositionCoverage } from '../utils/positionUtils';

export function TeamBuilderPage() {
  const { team, teams, currentTeamId, removeHitter, removePitcher, updateHitter, updatePitcher, updateTeamName, clearTeam, addHitter, addPitcher, setBallpark, setBallparkStrategy, createNewTeam, switchTeam, deleteTeam, duplicateTeam } = useTeam();
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  const { weights } = useScoringWeights();
  const { ballparks } = useBallparks();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(team.name);
  const [showAutoBuild, setShowAutoBuild] = useState(false);

  const requirements = DEFAULT_ROSTER_REQUIREMENTS;
  const totalPlayers = team.hitters.length + team.pitchers.length;
  const salaryRemaining = requirements.salaryCap - team.totalSalary;
  const isOverCap = team.totalSalary > requirements.salaryCap;

  // Pitchers who CAN start (have S in endurance)
  const canStart = team.pitchers.filter((p) => p.endurance?.toUpperCase().includes('S'));
  
  // Pitchers who CAN relieve (have R or C in endurance)
  const canRelieve = team.pitchers.filter((p) => {
    const end = p.endurance?.toUpperCase();
    return end?.includes('R') || end?.includes('C');
  });
  
  // Pure relievers - can relieve but CANNOT start
  const pureRelievers = team.pitchers.filter((p) => {
    const end = p.endurance?.toUpperCase() || '';
    const canRelieverole = end.includes('R') || end.includes('C');
    const canStartRole = end.includes('S');
    const isPure = canRelieverole && !canStartRole;
    console.log(`Pitcher ${p.name}: endurance="${end}", canRelieve=${canRelieverole}, canStart=${canStartRole}, isPure=${isPure}`);
    return isPure;
  });
  
  // Debug pure relievers
  if (team.pitchers.length > 0) {
    console.log('All pitchers:', team.pitchers.map(p => ({name: p.name, endurance: p.endurance})));
    console.log('Pure relievers count:', pureRelievers.length);
    console.log('Pure relievers:', pureRelievers.map(p => ({name: p.name, endurance: p.endurance})));
  }

  const catchers = team.hitters.filter((h) => {
    const positions = h.positions?.toUpperCase().split('/').map(p => p.trim()) || [];
    return positions.some(pos => pos.startsWith('C-'));
  });
  const positionCoverage = checkPositionCoverage(team.hitters);

  const handleSaveName = () => {
    updateTeamName(tempName);
    setEditingName(false);
  };

  const meetsRequirements = () => {
    return (
      team.pitchers.length >= requirements.minPitchers &&
      team.pitchers.length <= requirements.maxPitchers &&
      canStart.length >= requirements.minCanStart &&
      canRelieve.length >= requirements.minCanRelieve &&
      pureRelievers.length >= requirements.minPureRelievers &&
      team.hitters.length >= requirements.minHitters &&
      team.hitters.length <= requirements.maxHitters &&
      catchers.length >= requirements.minCatchers &&
      (!requirements.requireAllPositions || positionCoverage.allCovered) &&
      !isOverCap
    );
  };

  const handleAutoBuild = (strategy: AutoBuildStrategy) => {
    const hittersWithStats = hitters.map((h) => calculateHitterStats(h, weights.hitter));
    const pitchersWithStats = pitchers.map((p) => calculatePitcherStats(p, weights.pitcher));

    const { selectedHitters, selectedPitchers } = autoSelectTeam(
      hittersWithStats,
      pitchersWithStats,
      strategy,
      requirements.salaryCap
    );

    clearTeam();
    selectedHitters.forEach((h) => addHitter(h));
    selectedPitchers.forEach((p) => addPitcher(p));
  };

  const handleUpdateHitterNotes = (id: string, notes: string) => {
    const hitter = team.hitters.find(h => h.id === id);
    if (hitter) {
      updateHitter(id, { ...hitter, notes });
    }
  };

  const handleUpdatePitcherNotes = (id: string, notes: string) => {
    const pitcher = team.pitchers.find(p => p.id === id);
    if (pitcher) {
      updatePitcher(id, { ...pitcher, notes });
    }
  };

  return (
    <div className="space-y-6">
      {showAutoBuild && (
        <AutoBuildModal
          onClose={() => setShowAutoBuild(false)}
          onBuild={handleAutoBuild}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div className="flex items-center gap-3">
            <select
              value={currentTeamId}
              onChange={(e) => switchTeam(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.hitters.length + t.pitchers.length} players)
                </option>
              ))}
            </select>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="text-xl font-bold px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Rename
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => createNewTeam()}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            New Team
          </button>
          <button
            onClick={() => duplicateTeam(currentTeamId)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button
            onClick={() => setShowAutoBuild(true)}
            className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2 text-sm"
          >
            <Zap className="h-4 w-4" />
            Auto Build
          </button>
          <button
            onClick={clearTeam}
            className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete team "${team.name}"? This cannot be undone.`)) {
                deleteTeam(currentTeamId);
              }
            }}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-3 ${isOverCap ? 'border-2 border-red-500' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className={`h-4 w-4 ${isOverCap ? 'text-red-600' : 'text-green-600'}`} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Salary Cap</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(team.totalSalary)}
          </p>
          <p className={`text-xs ${isOverCap ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
            {isOverCap ? 'OVER CAP by ' : 'Remaining: '}
            {formatCurrency(Math.abs(salaryRemaining))}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Cap: {formatCurrency(requirements.salaryCap)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total Players: {totalPlayers} (need 23-29)
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Pitchers</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{team.pitchers.length}</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mt-1">
            <p>Required: {requirements.minPitchers}-{requirements.maxPitchers}</p>
            <p>Who can start: {canStart.length} (need {requirements.minCanStart})</p>
            <p>Who can relieve: {canRelieve.length} (need {requirements.minCanRelieve})</p>
            <p>Pure relievers: {pureRelievers.length} (need {requirements.minPureRelievers})</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Hitters</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{team.hitters.length}</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mt-1">
            <p>Required: {requirements.minHitters}-{requirements.maxHitters}</p>
            <p>Catchers: {catchers.length} (need {requirements.minCatchers})</p>
            <p>Positions: {positionCoverage.covered.length}/9 {!positionCoverage.allCovered && `(missing: ${positionCoverage.missing.join(', ')})`}</p>
          </div>
        </div>
      </div>

      {!meetsRequirements() && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">Roster Requirements Not Met</h4>
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                Add players from the Hitters and Pitchers pages to meet all roster requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Ballpark Selection</h3>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Strategy
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setBallparkStrategy('offense')}
              className={`px-2 py-2 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'offense'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-xs font-semibold">Heavy Offense</div>
              <div className="text-xs mt-0.5 opacity-75">High HR, High Singles</div>
            </button>
            <button
              onClick={() => setBallparkStrategy('balanced')}
              className={`px-2 py-2 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'balanced'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-xs font-semibold">Balanced</div>
              <div className="text-xs mt-0.5 opacity-75">Neutral Park</div>
            </button>
            <button
              onClick={() => setBallparkStrategy('defense')}
              className={`px-2 py-2 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'defense'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-xs font-semibold">Heavy Defense</div>
              <div className="text-xs mt-0.5 opacity-75">Low HR, Low Singles</div>
            </button>
            <button
              onClick={() => setBallparkStrategy('speedDefense')}
              className={`px-2 py-2 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'speedDefense'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-xs font-semibold">Speed/Defense</div>
              <div className="text-xs mt-0.5 opacity-75">High Singles, Low HR</div>
            </button>
          </div>
        </div>

        {ballparks.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Choose Ballpark {
                team.ballparkStrategy === 'offense' ? '(Offense)' : 
                team.ballparkStrategy === 'defense' ? '(Defense)' : 
                team.ballparkStrategy === 'speedDefense' ? '(Speed/Defense)' :
                '(Balanced)'
              }
            </label>
            <select
              value={team.ballpark?.id || ''}
              onChange={(e) => {
                const selected = ballparks.find((b) => b.id === e.target.value);
                setBallpark(selected);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a ballpark...</option>
              {ballparks
                .sort((a, b) => {
                  if (team.ballparkStrategy === 'offense') {
                    const aScore = (a.singlesLeft + a.singlesRight + a.homeRunsLeft * 3 + a.homeRunsRight * 3) / 8;
                    const bScore = (b.singlesLeft + b.singlesRight + b.homeRunsLeft * 3 + b.homeRunsRight * 3) / 8;
                    return bScore - aScore;
                  } else if (team.ballparkStrategy === 'defense') {
                    const aScore = ((42 - a.singlesLeft - a.singlesRight) + (42 - a.homeRunsLeft - a.homeRunsRight) * 3) / 8;
                    const bScore = ((42 - b.singlesLeft - b.singlesRight) + (42 - b.homeRunsLeft - b.homeRunsRight) * 3) / 8;
                    return bScore - aScore;
                  } else if (team.ballparkStrategy === 'speedDefense') {
                    const aScore = ((a.singlesLeft + a.singlesRight) / 2) + (((42 - a.homeRunsLeft - a.homeRunsRight) * 3) / 2);
                    const bScore = ((b.singlesLeft + b.singlesRight) / 2) + (((42 - b.homeRunsLeft - b.homeRunsRight) * 3) / 2);
                    return bScore - aScore;
                  }
                  return a.name.localeCompare(b.name);
                })
                .map((ballpark) => (
                  <option key={ballpark.id} value={ballpark.id}>
                    {ballpark.name} {ballpark.team ? `(${ballpark.team})` : ''}
                  </option>
                ))}
            </select>
            {team.ballpark && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Singles: L{team.ballpark.singlesLeft} / R{team.ballpark.singlesRight}</p>
                <p>Home Runs: L{team.ballpark.homeRunsLeft} / R{team.ballpark.homeRunsRight}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {(() => {
        console.log('[TeamBuilder] Current team:', team);
        console.log('[TeamBuilder] Team hitters:', team.hitters.length, team.hitters);
        console.log('[TeamBuilder] Team pitchers:', team.pitchers.length, team.pitchers);
        const hittersWithStats = team.hitters.map(h => calculateHitterStats(h, weights.hitter));
        const pitchersWithStats = team.pitchers.map(p => calculatePitcherStats(p, weights.pitcher));
        console.log('[TeamBuilder] Hitters with stats:', hittersWithStats.length);
        console.log('[TeamBuilder] Pitchers with stats:', pitchersWithStats.length);
        return (
          <TeamRosterTable
            hitters={hittersWithStats}
            pitchers={pitchersWithStats}
            onRemoveHitter={removeHitter}
            onRemovePitcher={removePitcher}
            onUpdateHitterNotes={handleUpdateHitterNotes}
            onUpdatePitcherNotes={handleUpdatePitcherNotes}
          />
        );
      })()}
    </div>
  );
}
