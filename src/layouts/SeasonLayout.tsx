import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeasonTeam } from '../hooks/useSeasonTeam';

export function SeasonLayout() {
  const location = useLocation();
  const { selectedTeamName } = useSeasonTeam();

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    // Player Data
    { path: '/season/manage/roster-management', label: 'Roster Management' },
    { path: '/season/manage/league-teams', label: 'League Teams' },
    { path: '/season/manage/hitters', label: 'Hitters' },
    { path: '/season/manage/pitchers', label: 'Pitchers' },
    { path: '/season/manage/wanted-players', label: 'Wanted Players' },
    { path: '/season/manage/lineup-optimizer', label: 'Lineup Optimizer' },
    { path: '/season/manage/pitching-rotation', label: 'Pitching Rotation' },
    
    // Team Management
    { path: '/season/manage/hitter-preferences', label: 'Hitter Preferences' },
    { path: '/season/manage/pitcher-preferences', label: 'Pitcher Preferences' },
    { path: '/season/manage/team-strategy', label: 'Team Strategy' },
    
    // Analysis & Planning
    { path: '/season/manage/opponent-analysis', label: 'Opponent Analysis' },
    { path: '/season/manage/game-starters', label: 'Game Starters' },
    { path: '/season/manage/player-cards', label: 'Player Cards' },
    { path: '/season/manage/player-card-insights', label: 'Card Insights' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4 mb-3">
          <Link
            to="/season"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Teams
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {selectedTeamName || 'No Team Selected'}
          </span>
        </div>
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(tab.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <Outlet />
    </div>
  );
}
