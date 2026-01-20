import { Link, Outlet, useLocation } from 'react-router-dom';

export function SeasonLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <nav className="flex space-x-2 overflow-x-auto">
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
