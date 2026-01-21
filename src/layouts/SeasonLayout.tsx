import { Link, Outlet, useLocation } from 'react-router-dom';

export function SeasonLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <nav className="flex space-x-2 overflow-x-auto">
          <Link
            to="/season/hitter-preferences"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/season/hitter-preferences')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Hitter Preferences
          </Link>
          <Link
            to="/season/hitters"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/season/hitters')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Hitters
          </Link>
          <Link
            to="/season/pitchers"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/season/pitchers')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pitchers
          </Link>
          <Link
            to="/season/team-rosters"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/season/team-rosters')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Team Rosters
          </Link>
          <Link
            to="/season/overview"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/season/overview')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Overview
          </Link>
        </nav>
      </div>
      
      <Outlet />
    </div>
  );
}
