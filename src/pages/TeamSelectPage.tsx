import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, ChevronRight } from 'lucide-react';
import { useSeasonTeam } from '../hooks/useSeasonTeam';

export function TeamSelectPage() {
  const { selectedTeamName, selectTeam } = useSeasonTeam();
  const navigate = useNavigate();
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // The user's season teams are stored as selectedTeamName (persisted).
  // For now we show the currently saved season team. If none exists, prompt to add one.
  const seasonTeams = selectedTeamName ? [selectedTeamName] : [];

  const handleSelectTeam = async (teamName: string) => {
    await selectTeam(teamName);
    navigate('/season/manage/roster-management');
  };

  const handleAddSeason = async () => {
    const name = newTeamName.trim();
    if (!name) return;
    await selectTeam(name);
    setNewTeamName('');
    setShowAddSeason(false);
    navigate('/season/manage/roster-management');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Trophy className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Season Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select your team to manage the season
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
        {seasonTeams.map((teamName) => (
          <button
            key={teamName}
            onClick={() => handleSelectTeam(teamName)}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all px-8 py-5 flex items-center justify-between group"
          >
            <span className="text-xl font-bold">{teamName}</span>
            <ChevronRight className="h-6 w-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        ))}

        {!showAddSeason ? (
          <button
            onClick={() => setShowAddSeason(true)}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 rounded-xl px-8 py-5 flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
          >
            <Plus className="h-6 w-6" />
            <span className="text-lg font-medium">Add Season</span>
          </button>
        ) : (
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-primary-400 dark:border-primary-500 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Add Season Team</h3>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSeason()}
              placeholder="Enter your team name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddSeason}
                disabled={!newTeamName.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
              >
                Add & Manage
              </button>
              <button
                onClick={() => { setShowAddSeason(false); setNewTeamName(''); }}
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
