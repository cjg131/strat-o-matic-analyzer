import { useState } from 'react';

interface Game {
  gameNumber: number;
  opponent: string;
  isHome: boolean;
  recommendedStarter: string;
}

interface GameDay {
  date: string;
  ballpark: string;
  ballparkFactors: string;
  games: Game[];
  ballparkImage: string;
}

export function GameStartersPage() {
  const [schedule] = useState<GameDay[]>([
    {
      date: 'Friday, 1/23',
      ballpark: "Forbes Field '09",
      ballparkFactors: 'SI: L 1-8, R 1-8 / HR: L 0, R 0',
      ballparkImage: '/ballparks/forbes.jpg',
      games: [
        { gameNumber: 1, opponent: 'Washington Capitals II', isHome: true, recommendedStarter: 'Clarkson, John (R, 1R) S9*' },
        { gameNumber: 2, opponent: 'Washington Capitals II', isHome: true, recommendedStarter: 'Cooper, Wilbur (L, E) S8' },
        { gameNumber: 3, opponent: 'Washington Capitals II', isHome: true, recommendedStarter: 'Johnson, School Boy (R, 1R) S8*' },
      ]
    },
    {
      date: 'Saturday, 1/24',
      ballpark: 'Comerica Park 2012',
      ballparkFactors: 'SI: L 1-11, R 1-11 / HR: L 1-8, R 1-8',
      ballparkImage: '/ballparks/comerica.jpg',
      games: [
        { gameNumber: 4, opponent: 'Forest City Grays', isHome: false, recommendedStarter: 'Fraser, Chick (R, E) S9*' },
        { gameNumber: 5, opponent: 'Forest City Grays', isHome: false, recommendedStarter: 'Thurston, Sloppy (R, 2R) S9*/R3' },
        { gameNumber: 6, opponent: 'Forest City Grays', isHome: false, recommendedStarter: 'Clarkson, John (R, 1R) S9*' },
      ]
    },
    {
      date: 'Sunday, 1/25',
      ballpark: "Forbes Field '09",
      ballparkFactors: 'SI: L 1-8, R 1-8 / HR: L 0, R 0',
      ballparkImage: '/ballparks/forbes.jpg',
      games: [
        { gameNumber: 7, opponent: 'Northfield Retirees', isHome: true, recommendedStarter: 'Cooper, Wilbur (L, E) S8' },
        { gameNumber: 8, opponent: 'Northfield Retirees', isHome: true, recommendedStarter: '' },
        { gameNumber: 9, opponent: 'Northfield Retirees', isHome: true, recommendedStarter: '' },
      ]
    },
    {
      date: 'Monday, 1/26',
      ballpark: "Dodger Stadium '78",
      ballparkFactors: 'SI: L 1-9, R 1-9 / HR: L 1-12, R 1-12',
      ballparkImage: '/ballparks/dodger.jpg',
      games: [
        { gameNumber: 10, opponent: 'Washington Capitals II', isHome: false, recommendedStarter: '' },
        { gameNumber: 11, opponent: 'Washington Capitals II', isHome: false, recommendedStarter: '' },
        { gameNumber: 12, opponent: 'Washington Capitals II', isHome: false, recommendedStarter: '' },
      ]
    },
    {
      date: 'Tuesday, 1/27',
      ballpark: "League Park '24",
      ballparkFactors: 'SI: L 1-13, R 1-6 / HR: L 1-4, R 1',
      ballparkImage: '/ballparks/league.jpg',
      games: [
        { gameNumber: 13, opponent: 'Northfield Retirees', isHome: false, recommendedStarter: '' },
        { gameNumber: 14, opponent: 'Northfield Retirees', isHome: false, recommendedStarter: '' },
        { gameNumber: 15, opponent: 'Northfield Retirees', isHome: false, recommendedStarter: '' },
      ]
    },
  ]);

  const [selectedStarters, setSelectedStarters] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    schedule.forEach(day => {
      day.games.forEach(game => {
        if (game.recommendedStarter) {
          initial[game.gameNumber] = game.recommendedStarter;
        }
      });
    });
    return initial;
  });

  const availablePitchers = [
    'Cooper, Wilbur (L, E) S8',
    'Clarkson, John (R, 1R) S9*',
    'Fraser, Chick (R, E) S9*',
    'Johnson, School Boy (R, 1R) S8*',
    'Thurston, Sloppy (R, 2R) S9*/R3',
    'Earnshaw, George (R, E) S8*/R4',
  ];

  const handleStarterChange = (gameNumber: number, pitcher: string) => {
    setSelectedStarters(prev => ({
      ...prev,
      [gameNumber]: pitcher
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Starting Pitchers for specific games
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You can assign specific starting pitchers to start each game of your schedule below. If you do not assign a pitcher to start a given game, 
          the rotation that you set in the Pitching Rotation section will be followed. After you've made your changes, press the "Save Starters" 
          button at the bottom of the page.
        </p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          You may not leave any empty spaces between pitchers (i.e. set pitchers for Games 2 and 4 and leave 3 empty). The exception is if you 
          have at least 1 starting pitcher injured for that game.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Pitchers marked with an asterisk (*) may pitch on 3 days of rest. All other pitchers need 4 days of rest.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          I-# - indicates that the pitcher is injured (for # more day(s)).
        </p>
      </div>

      {schedule.map((day) => (
        <div key={day.date} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">
              {day.date} - at {day.ballpark} - ({day.ballparkFactors})
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex gap-6">
              {/* Ballpark image placeholder */}
              <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">Ballpark</span>
              </div>

              {/* Games list */}
              <div className="flex-1 space-y-3">
                {day.games.map((game) => (
                  <div key={game.gameNumber} className="flex items-center gap-4">
                    <div className="w-24 font-semibold text-gray-900 dark:text-white">
                      Game {game.gameNumber}:
                    </div>
                    <div className="w-64 text-gray-700 dark:text-gray-300">
                      {game.isHome ? '' : '@ '}{game.opponent}
                    </div>
                    <select
                      value={selectedStarters[game.gameNumber] || ''}
                      onChange={(e) => handleStarterChange(game.gameNumber, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">--- Select Starter ---</option>
                      {availablePitchers.map(pitcher => (
                        <option key={pitcher} value={pitcher}>{pitcher}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors">
          RESET TO ROTATION
        </button>
        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          SAVE STARTERS
        </button>
      </div>
    </div>
  );
}
