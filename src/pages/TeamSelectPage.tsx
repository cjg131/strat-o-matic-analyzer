import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Copy, ChevronRight } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useScoringWeights } from '../hooks/useScoringWeights';
import { formatCurrency, calculateHitterStats, calculatePitcherStats } from '../utils/calculations';

export function TeamSelectPage() {
  const { teams, currentTeamId, switchTeam, createNewTeam, deleteTeam, duplicateTeam } = useTeam();
  const { weights } = useScoringWeights();
  const navigate = useNavigate();

  const handleSelectTeam = async (teamId: string) => {
    await switchTeam(teamId);
    navigate('/season/manage/roster-management');
  };

  const handleDeleteTeam = (e: React.MouseEvent, teamId: string, teamName: string) => {
    e.stopPropagation();
    if (teams.length <= 1) {
      alert('Cannot delete the last team. You must have at least one team.');
      return;
    }
    if (confirm(`Delete team "${teamName}"? This cannot be undone.`)) {
      deleteTeam(teamId);
    }
  };

  const handleDuplicateTeam = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    duplicateTeam(teamId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Season Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select a team to manage
            </p>
          </div>
        </div>
        <button
          onClick={() => createNewTeam()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          New Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const totalPlayers = team.hitters.length + team.pitchers.length;
          const hittersWithStats = team.hitters.map(h => calculateHitterStats(h, weights.hitter));
          const pitchersWithStats = team.pitchers.map(p => calculatePitcherStats(p, weights.pitcher));
          const totalFP = [
            ...hittersWithStats.map(h => h.fantasyPoints),
            ...pitchersWithStats.map(p => p.fantasyPoints),
          ].reduce((sum, fp) => sum + fp, 0);

          const starters = team.pitchers.filter(p => p.endurance?.toUpperCase().includes('S'));
          const relievers = team.pitchers.filter(p => {
            const end = p.endurance?.toUpperCase() || '';
            return (end.includes('R') || end.includes('C')) && !end.includes('S');
          });

          return (
            <div
              key={team.id}
              onClick={() => handleSelectTeam(team.id)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 ${
                team.id === currentTeamId
                  ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'border-transparent hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white truncate">{team.name}</h2>
                  <ChevronRight className="h-5 w-5 text-white/70" />
                </div>
                {team.id === currentTeamId && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                    Currently Active
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPlayers}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Players</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(team.totalSalary)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Salary</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalFP.toFixed(0)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total FP</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Hitters</span>
                    <span className="font-medium text-gray-900 dark:text-white">{team.hitters.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Starters</span>
                    <span className="font-medium text-gray-900 dark:text-white">{starters.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Relievers</span>
                    <span className="font-medium text-gray-900 dark:text-white">{relievers.length}</span>
                  </div>
                  {team.ballpark && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Ballpark</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate ml-2">{team.ballpark.name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => handleDuplicateTeam(e, team.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Duplicate team"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTeam(e, team.id, team.name)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete team"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* New Team Card */}
        <div
          onClick={() => createNewTeam()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 flex items-center justify-center min-h-[280px]"
        >
          <div className="text-center">
            <Plus className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Create New Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
