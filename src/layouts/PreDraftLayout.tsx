import { Link, Outlet, useLocation } from 'react-router-dom';

export function PreDraftLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <nav className="flex space-x-2 overflow-x-auto">
          <Link
            to="/pre-draft/hitters"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/pre-draft/hitters')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Hitters
          </Link>
          <Link
            to="/pre-draft/pitchers"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/pre-draft/pitchers')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pitchers
          </Link>
          <Link
            to="/pre-draft/ballparks"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/pre-draft/ballparks')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Ballparks
          </Link>
          <Link
            to="/pre-draft/team-builder"
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/pre-draft/team-builder')
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Team Builder
          </Link>
        </nav>
      </div>
      
      <Outlet />
    </div>
  );
}
