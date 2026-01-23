import { usePlayerCards } from '../hooks/usePlayerCards';
import { AlertCircle, TrendingUp, Shield, Zap } from 'lucide-react';

export function PlayerCardInsightsPage() {
  const { playerCards } = usePlayerCards();

  const hitterCards = playerCards.filter(c => c.playerType === 'hitter');
  const pitcherCards = playerCards.filter(c => c.playerType === 'pitcher');

  const getDefensiveInsights = () => {
    const insights: string[] = [];
    
    hitterCards.forEach(card => {
      if (card.defense?.positions) {
        Object.entries(card.defense.positions).forEach(([pos, stats]) => {
          if (stats.range === 1) {
            insights.push(`${card.playerName}: Elite ${pos} defense (Range 1, ${stats.error} errors)`);
          }
          if (stats.arm && stats.arm <= -4) {
            insights.push(`${card.playerName}: Elite arm at ${pos} (${stats.arm})`);
          }
        });
      }
    });
    
    return insights;
  };

  const getSpeedInsights = () => {
    const insights: string[] = [];
    
    hitterCards.forEach(card => {
      if (card.running) {
        if (card.running.stealRating && ['AAA', 'AA', 'A'].includes(card.running.stealRating)) {
          insights.push(`${card.playerName}: Elite base stealer (${card.running.stealRating})`);
        }
        if (card.running.runRating && card.running.runRating.includes('1-17')) {
          insights.push(`${card.playerName}: Maximum speed (${card.running.runRating})`);
        }
        if (card.running.bunting && ['A', 'B'].includes(card.running.bunting)) {
          insights.push(`${card.playerName}: Good bunter (${card.running.bunting})`);
        }
      }
    });
    
    return insights;
  };

  const getPitchingInsights = () => {
    const insights: string[] = [];
    
    pitcherCards.forEach(card => {
      if (card.pitching?.endurance) {
        if (card.pitching.endurance.startsWith('S')) {
          insights.push(`${card.playerName}: Starter (${card.pitching.endurance})`);
        } else if (card.pitching.endurance.startsWith('C')) {
          insights.push(`${card.playerName}: Closer (${card.pitching.endurance})`);
        } else if (card.pitching.endurance.startsWith('R')) {
          insights.push(`${card.playerName}: Reliever (${card.pitching.endurance})`);
        }
      }
    });
    
    return insights;
  };

  const defensiveInsights = getDefensiveInsights();
  const speedInsights = getSpeedInsights();
  const pitchingInsights = getPitchingInsights();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Player Card Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced stats extracted from your uploaded player cards
        </p>
      </div>

      {playerCards.length === 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                No Player Cards Uploaded
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Upload player cards to see advanced insights that will help optimize your lineups, rotations, and strategy.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Defensive Insights */}
          {defensiveInsights.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Defensive Strengths
                </h2>
              </div>
              <ul className="space-y-2">
                {defensiveInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Strategy Tip:</strong> Use these elite defenders in late-inning defensive substitutions when protecting a lead.
                </p>
              </div>
            </div>
          )}

          {/* Speed Insights */}
          {speedInsights.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Speed & Baserunning
                </h2>
              </div>
              <ul className="space-y-2">
                {speedInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-xs text-green-800 dark:text-green-300">
                  <strong>Strategy Tip:</strong> Use elite base stealers as pinch runners in close games. Position good bunters at the top of the lineup.
                </p>
              </div>
            </div>
          )}

          {/* Pitching Insights */}
          {pitchingInsights.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pitching Staff Breakdown
                </h2>
              </div>
              <ul className="space-y-2">
                {pitchingInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  <strong>Strategy Tip:</strong> Starters need 4 days rest. Closers are most effective in 9th inning with 1-3 run lead.
                </p>
              </div>
            </div>
          )}

          {/* All Cards Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Uploaded Cards Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hitters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{hitterCards.length}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pitchers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pitcherCards.length}</p>
              </div>
            </div>
            
            {playerCards.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Uploads:</h3>
                <ul className="space-y-1">
                  {playerCards.slice(0, 5).map(card => (
                    <li key={card.id} className="text-sm text-gray-700 dark:text-gray-300">
                      {card.playerName} ({card.playerType})
                      {card.running?.stealRating && ` - Steal: ${card.running.stealRating}`}
                      {card.pitching?.endurance && ` - ${card.pitching.endurance}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Debug Section - Show Raw Extracted Data */}
          {playerCards.length > 0 && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🔍 Debug: Extracted Data</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {playerCards.map(card => (
                  <div key={card.id} className="border-b border-gray-200 dark:border-gray-600 pb-3">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{card.playerName}</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify({
                        defense: card.defense,
                        running: card.running,
                        hitting: card.hitting,
                        pitching: card.pitching
                      }, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
