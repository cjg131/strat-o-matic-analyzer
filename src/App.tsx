import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { HittersPage } from './pages/HittersPage';
import { PitchersPage } from './pages/PitchersPage';
import { BallparksPage } from './pages/BallparksPage';
import { TeamBuilderPage } from './pages/TeamBuilderPage';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Activity className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                Strat-O-Matic
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Settings
            </Link>
            <Link
              to="/hitters"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/hitters')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Hitters
            </Link>
            <Link
              to="/pitchers"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pitchers')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Pitchers
            </Link>
            <Link
              to="/ballparks"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/ballparks')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Ballparks
            </Link>
            <Link
              to="/team"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/team')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Team Builder
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/hitters" element={<HittersPage />} />
            <Route path="/pitchers" element={<PitchersPage />} />
            <Route path="/ballparks" element={<BallparksPage />} />
            <Route path="/team" element={<TeamBuilderPage />} />
          </Routes>
        </main>

        <footer className="bg-white dark:bg-gray-800 shadow-lg mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Strat-O-Matic Player Evaluator
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
