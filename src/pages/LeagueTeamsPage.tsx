import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useSeasonTeam } from '../hooks/useSeasonTeam';

export function LeagueTeamsPage() {
  const { availableTeams, selectedTeamName, getTeamStats } = useSeasonTeam();
  const navigate = useNavigate();

  const handleSelectTeam = (teamName: string) => {
    navigate(`/season/manage/league-team/${encodeURIComponent(teamName)}`);
  };

  if (availableTeams.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">League Teams</h2>
        <p className="text-gray-600 dark:text-gray-400">
          No league teams found yet. Import your roster images in the <strong>Roster Management</strong> tab to populate all league teams.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">League Teams</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a team to view their roster and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTeams.map((teamName) => {
          const stats = getTeamStats(teamName);
          const isMyTeam = teamName === selectedTeamName;

          return (
            <div
              key={teamName}
              onClick={() => handleSelectTeam(teamName)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 ${
                isMyTeam
                  ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'border-transparent hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white truncate">{teamName}</h2>
                  <ChevronRight className="h-5 w-5 text-white/70" />
                </div>
                {isMyTeam && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                    Your Team
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPlayers}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Players</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hitterCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hitters</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pitcherCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pitchers</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
