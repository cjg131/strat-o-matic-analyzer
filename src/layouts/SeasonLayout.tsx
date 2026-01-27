import { Link, Outlet, useLocation } from 'react-router-dom';

export function SeasonLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    // Player Data
    { path: '/season/hitters', label: 'Hitters' },
    { path: '/season/pitchers', label: 'Pitchers' },
    { path: '/season/team-rosters', label: 'Team Rosters' },
    
    // Team Management
    { path: '/season/hitter-preferences', label: 'Hitter Preferences' },
    { path: '/season/pitcher-preferences', label: 'Pitcher Preferences' },
    { path: '/season/team-strategy', label: 'Team Strategy' },
    
    // Analysis & Planning
    { path: '/season/opponent-analysis', label: 'Opponent Analysis' },
    { path: '/season/game-starters', label: 'Game Starters' },
    { path: '/season/wanted-players', label: 'Wanted Players' },
    
    // Optimization Tools
    { path: '/season/lineup-optimizer', label: 'Lineup Optimizer' },
    { path: '/season/pitching-rotation', label: 'Pitching Rotation' },
    
    // Player Cards
    { path: '/season/player-cards', label: 'Player Cards' },
    { path: '/season/player-card-insights', label: 'Card Insights' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
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
