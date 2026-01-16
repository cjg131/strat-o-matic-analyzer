import { useState } from 'react';
import { Users, Trash2, DollarSign, AlertCircle, Zap } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { useBallparks } from '../hooks/useBallparks';
import { DEFAULT_ROSTER_REQUIREMENTS } from '../types';
import { formatCurrency, calculateHitterStats, calculatePitcherStats } from '../utils/calculations';
import { autoSelectTeam, AutoBuildStrategy } from '../utils/autoTeamBuilder';
import { AutoBuildModal } from '../components/AutoBuildModal';

export function TeamBuilderPage() {
  const { team, removeHitter, removePitcher, updateTeamName, clearTeam, addHitter, addPitcher, setBallpark, setBallparkStrategy } = useTeam();
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
    return canRelieverole && !canStartRole;
  });

  const catchers = team.hitters.filter((h) => h.positions?.toUpperCase().includes('C'));

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

  return (
    <div className="space-y-6">
      {showAutoBuild && (
        <AutoBuildModal
          onClose={() => setShowAutoBuild(false)}
          onBuild={handleAutoBuild}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="text-3xl font-bold px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>
          ) : (
            <h1
              className="text-3xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600"
              onClick={() => setEditingName(true)}
            >
              {team.name}
            </h1>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAutoBuild(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Auto Build
          </button>
          <button
            onClick={clearTeam}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${isOverCap ? 'border-2 border-red-500' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`h-5 w-5 ${isOverCap ? 'text-red-600' : 'text-green-600'}`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Salary Cap</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(team.totalSalary)}
          </p>
          <p className={`text-sm ${isOverCap ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
            {isOverCap ? 'OVER CAP by ' : 'Remaining: '}
            {formatCurrency(Math.abs(salaryRemaining))}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Cap: {formatCurrency(requirements.salaryCap)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pitchers</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{team.pitchers.length}</p>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
            <p>Required: {requirements.minPitchers}-{requirements.maxPitchers}</p>
            <p>Who can start: {canStart.length} (need {requirements.minCanStart})</p>
            <p>Who can relieve: {canRelieve.length} (need {requirements.minCanRelieve})</p>
            <p>Pure relievers: {pureRelievers.length} (need {requirements.minPureRelievers})</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hitters</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{team.hitters.length}</p>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
            <p>Required: {requirements.minHitters}-{requirements.maxHitters}</p>
            <p>Catchers: {catchers.length} (need {requirements.minCatchers})</p>
            <p>Total Players: {totalPlayers} (need 24-28)</p>
          </div>
        </div>
      </div>

      {!meetsRequirements() && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Roster Requirements Not Met</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Add players from the Hitters and Pitchers pages to meet all roster requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ballpark Selection</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Strategy
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setBallparkStrategy('offense')}
              className={`px-4 py-3 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'offense'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-semibold">Heavy Offense</div>
              <div className="text-xs mt-1">High HR, High Singles</div>
            </button>
            <button
              onClick={() => setBallparkStrategy('balanced')}
              className={`px-4 py-3 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'balanced'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-semibold">Balanced</div>
              <div className="text-xs mt-1">Neutral Park</div>
            </button>
            <button
              onClick={() => setBallparkStrategy('defense')}
              className={`px-4 py-3 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'defense'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-semibold">Heavy Defense</div>
              <div className="text-xs mt-1">Low HR, Low Singles</div>
            </button>
            <button
              onClick={() => setBallparkStrategy('speedDefense')}
              className={`px-4 py-3 rounded-md border-2 transition-colors ${
                team.ballparkStrategy === 'speedDefense'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-semibold">Speed/Defense</div>
              <div className="text-xs mt-1">High Singles, Low HR</div>
            </button>
          </div>
        </div>

        {ballparks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Pitchers ({team.pitchers.length})
            </h2>
          </div>
          <div className="p-4">
            {team.pitchers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No pitchers added yet. Go to the Pitchers page to add players.
              </p>
            ) : (
              <div className="space-y-2">
                {team.pitchers.map((pitcher) => (
                  <div
                    key={pitcher.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{pitcher.name}</p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{pitcher.throwingArm || '-'}</span>
                        <span>{pitcher.endurance || '-'}</span>
                        <span className="font-mono">{formatCurrency(pitcher.salary)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removePitcher(pitcher.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove from team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Hitters ({team.hitters.length})
            </h2>
          </div>
          <div className="p-4">
            {team.hitters.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hitters added yet. Go to the Hitters page to add players.
              </p>
            ) : (
              <div className="space-y-2">
                {team.hitters.map((hitter) => (
                  <div
                    key={hitter.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{hitter.name}</p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{hitter.positions || '-'}</span>
                        <span className="font-mono">{formatCurrency(hitter.salary)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeHitter(hitter.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove from team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
