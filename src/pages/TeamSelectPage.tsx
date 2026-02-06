import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ChevronRight } from 'lucide-react';
import { useSeasonTeam } from '../hooks/useSeasonTeam';

export function TeamSelectPage() {
  const { selectedTeamName, availableTeams, selectTeam, getTeamStats } = useSeasonTeam();
  const navigate = useNavigate();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const handleSelectTeam = async (teamName: string) => {
    await selectTeam(teamName);
    navigate('/season/manage/roster-management');
  };

  const handleAddTeam = async () => {
    const name = newTeamName.trim();
    if (!name) return;
    await selectTeam(name);
    setNewTeamName('');
    setShowAddTeam(false);
    navigate('/season/manage/roster-management');
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
      </div>

      {availableTeams.length === 0 && !showAddTeam && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-800 dark:text-blue-200 mb-2">
            No season teams found. Teams are created when you import roster assignments via the Roster Management page.
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            You can also add a team manually below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTeams.map((teamName) => {
          const stats = getTeamStats(teamName);
          const isActive = teamName === selectedTeamName;

          return (
            <div
              key={teamName}
              onClick={() => handleSelectTeam(teamName)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 ${
                isActive
                  ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'border-transparent hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white truncate">{teamName}</h2>
                  <ChevronRight className="h-5 w-5 text-white/70" />
                </div>
                {isActive && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                    Currently Active
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="p-5 space-y-3">
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

        {/* Add Team Card */}
        {!showAddTeam ? (
          <div
            onClick={() => setShowAddTeam(true)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 flex items-center justify-center min-h-[200px]"
          >
            <div className="text-center">
              <Plus className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Add Team</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-primary-400 dark:border-primary-500 min-h-[200px] flex flex-col justify-center p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Add Season Team</h3>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
              placeholder="Enter team name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddTeam}
                disabled={!newTeamName.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
              >
                Add & Manage
              </button>
              <button
                onClick={() => { setShowAddTeam(false); setNewTeamName(''); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
