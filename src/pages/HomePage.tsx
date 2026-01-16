import { Link } from 'react-router-dom';
import { Settings, Users, TrendingUp, Activity } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Strat-O-Matic Player Evaluator
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Analyze and compare baseball players using custom fantasy point scoring
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          What This App Does
        </h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            This tool helps you evaluate Strat-O-Matic and Baseball 365 players by calculating
            fantasy points based on customizable scoring weights. Perfect for finding underpriced
            players and building optimal rosters.
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">Key Features:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Define custom scoring weights for hitters and pitchers</li>
            <li>Import or manually enter player season statistics</li>
            <li>Calculate total fantasy points and normalized metrics</li>
            <li>Sort and filter players to find the best values</li>
            <li>Compare points per 600 PA for hitters</li>
            <li>Compare points per IP for pitchers</li>
            <li>Identify underpriced players with points per dollar analysis</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/settings"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mb-4">
            <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Scoring Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Configure fantasy point weights for different stats. Customize how singles, doubles,
            home runs, strikeouts, and more contribute to player value.
          </p>
        </Link>

        <Link
          to="/hitters"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mb-4">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Hitters
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Manage hitter statistics and view calculated fantasy points. See points per 600 PA
            to normalize across different playing time.
          </p>
        </Link>

        <Link
          to="/pitchers"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mb-4">
            <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Pitchers
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Manage pitcher statistics and view calculated fantasy points. Compare efficiency
            with points per inning pitched and points per start.
          </p>
        </Link>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Why 600 PA Normalization?
        </h3>
        <p className="text-blue-800 dark:text-blue-200">
          We normalize hitter stats to 600 plate appearances because it represents a typical
          full season for an everyday player. This allows fair comparison between players with
          different amounts of playing time, helping you identify per-PA efficiency regardless
          of games played.
        </p>
      </div>
    </div>
  );
}
