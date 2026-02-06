import { useEffect } from 'react';
import { useParams, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeasonTeam } from '../hooks/useSeasonTeam';

export function LeagueTeamAnalysisPage() {
  const { teamName: encodedTeamName } = useParams<{ teamName: string }>();
  const teamName = decodeURIComponent(encodedTeamName || '');
  const { selectTeam } = useSeasonTeam();
  const location = useLocation();
  const navigate = useNavigate();

  // Set this team as the active season team so all child pages filter by it
  useEffect(() => {
    if (teamName) {
      selectTeam(teamName);
    }
  }, [teamName]);

  const basePath = `/season/manage/league-team/${encodeURIComponent(teamName)}`;

  const isActive = (subPath: string) => location.pathname === `${basePath}/${subPath}`;
  const isIndex = location.pathname === basePath;

  // Redirect to overview if at the base path
  useEffect(() => {
    if (isIndex) {
      navigate(`${basePath}/overview`, { replace: true });
    }
  }, [isIndex, basePath, navigate]);

  const tabs = [
    { path: 'overview', label: 'Overview' },
    { path: 'hitters', label: 'Hitters' },
    { path: 'pitchers', label: 'Pitchers' },
    { path: 'lineup-optimizer', label: 'Lineup Optimizer' },
    { path: 'pitching-rotation', label: 'Pitching Rotation' },
    { path: 'hitter-preferences', label: 'Hitter Preferences' },
    { path: 'pitcher-preferences', label: 'Pitcher Preferences' },
    { path: 'team-strategy', label: 'Team Strategy' },
    { path: 'opponent-analysis', label: 'Opponent Analysis' },
    { path: 'player-cards', label: 'Player Cards' },
    { path: 'player-card-insights', label: 'Card Insights' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4 mb-3">
          <Link
            to="/season/manage/league-teams"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            League Teams
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{teamName}</span>
        </div>
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={`${basePath}/${tab.path}`}
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
