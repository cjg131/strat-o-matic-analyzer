import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { HittersPage } from './pages/HittersPage';
import { PitchersPage } from './pages/PitchersPage';
import { BallparksPage } from './pages/BallparksPage';
import { TeamBuilderPage } from './pages/TeamBuilderPage';
import { SeasonOverviewPage } from './pages/SeasonOverviewPage';
import { PreDraftLayout } from './layouts/PreDraftLayout';
import { SeasonLayout } from './layouts/SeasonLayout';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Navigation() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

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
              to="/pre-draft/hitters"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/pre-draft')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Pre-Draft
            </Link>
            <Link
              to="/season/overview"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/season')
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Season
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
            {currentUser && (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Navigation />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              
              {/* Pre-Draft Section */}
              <Route path="/pre-draft" element={<ProtectedRoute><PreDraftLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/pre-draft/hitters" replace />} />
                <Route path="hitters" element={<HittersPage />} />
                <Route path="pitchers" element={<PitchersPage />} />
                <Route path="ballparks" element={<BallparksPage />} />
                <Route path="team-builder" element={<TeamBuilderPage />} />
              </Route>
              
              {/* Season Section */}
              <Route path="/season" element={<ProtectedRoute><SeasonLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/season/overview" replace />} />
                <Route path="overview" element={<SeasonOverviewPage />} />
              </Route>
              
              {/* Legacy redirects for old URLs */}
              <Route path="/hitters" element={<Navigate to="/pre-draft/hitters" replace />} />
              <Route path="/pitchers" element={<Navigate to="/pre-draft/pitchers" replace />} />
              <Route path="/ballparks" element={<Navigate to="/pre-draft/ballparks" replace />} />
              <Route path="/team" element={<Navigate to="/pre-draft/team-builder" replace />} />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
