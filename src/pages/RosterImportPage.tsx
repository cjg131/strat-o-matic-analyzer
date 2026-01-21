import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import rosterData from '../../roster-assignments.json';

interface ImportResult {
  success: boolean;
  playersUpdated: number;
  playersNotFound: string[];
  message: string;
}

export function RosterImportPage() {
  const { hitters, updateHitter } = useHitters();
  const { pitchers, updatePitcher } = usePitchers();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Function to match player names flexibly (handles abbreviated first names and separate season field)
  const matchPlayerName = (rosterName: string, dbName: string, dbSeason: string): boolean => {
    // Extract last name, first initial, and year/NeL from roster name format: "LastName, F. (YYYY)" or "LastName, F. (NeL)"
    const rosterMatch = rosterName.match(/^([^,]+),\s*([A-Z])\.?\s*\(([^)]+)\)$/);
    if (!rosterMatch) return false;
    
    const [, rosterLast, rosterFirstInitial, rosterYear] = rosterMatch;
    
    // Extract last name and first name from database format: "LastName, FirstName" or "LastName Jr., FirstName" or "LastName Jr, FirstName"
    const dbMatch = dbName.match(/^([^,]+),\s*(.+)$/);
    if (!dbMatch) return false;
    
    const [, dbLastRaw, dbFirst] = dbMatch;
    
    // Handle "Jr" or "Jr." in last name - normalize both
    const rosterLastNorm = rosterLast.trim().replace(/\s+Jr\.?$/i, '').toLowerCase();
    const dbLastNorm = dbLastRaw.trim().replace(/\s+Jr\.?$/i, '').toLowerCase();
    
    // Check if:
    // 1. Last names match (case-insensitive, ignoring Jr/Jr.)
    // 2. First name starts with the roster's first initial
    // 3. Season/year matches (including "NeL" for Negro League players)
    return rosterLastNorm === dbLastNorm && 
           dbFirst.trim().toUpperCase().startsWith(rosterFirstInitial) && 
           dbSeason.trim() === rosterYear.trim();
  };

  const importRosters = async () => {
    setImporting(true);
    setResult(null);

    let playersUpdated = 0;
    const playersNotFound: string[] = [];

    try {
      // Process each team's roster
      for (const [teamName, teamData] of Object.entries(rosterData.rosters)) {
        // Update pitchers
        for (const pitcherName of teamData.pitchers) {
          const pitcher = pitchers.find(p => matchPlayerName(pitcherName, p.name, p.season));
          if (pitcher) {
            await updatePitcher(pitcher.id, { ...pitcher, roster: teamName });
            playersUpdated++;
          } else {
            playersNotFound.push(`Pitcher: ${pitcherName} (${teamName})`);
          }
        }

        // Update hitters
        for (const hitterName of teamData.hitters) {
          const hitter = hitters.find(h => matchPlayerName(hitterName, h.name, h.season));
          if (hitter) {
            await updateHitter(hitter.id, { ...hitter, roster: teamName });
            playersUpdated++;
          } else {
            playersNotFound.push(`Hitter: ${hitterName} (${teamName})`);
          }
        }
      }

      setResult({
        success: true,
        playersUpdated,
        playersNotFound,
        message: `Successfully updated ${playersUpdated} players with roster assignments.`
      });
    } catch (error) {
      setResult({
        success: false,
        playersUpdated,
        playersNotFound,
        message: `Error during import: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Import Roster Assignments
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Import roster assignments from the draft to assign players to their teams
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          {(hitters.length === 0 && pitchers.length === 0) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                ⚠️ No Players Found in Database
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                You need to import your hitters and pitchers data first before running the roster import.
                Go to <strong>Pre-Draft → Hitters</strong> and <strong>Pre-Draft → Pitchers</strong> to import your player data.
              </p>
            </div>
          )}

          {(hitters.length > 0 || pitchers.length > 0) && (
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Database Status:
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <div>Hitters in database: {hitters.length}</div>
                <div>Pitchers in database: {pitchers.length}</div>
                {hitters.length > 0 && (
                  <div className="mt-2 text-xs">
                    <strong>Sample hitter names:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {hitters.slice(0, 3).map(h => <li key={h.id}>{h.name}</li>)}
                    </ul>
                  </div>
                )}
                {pitchers.length > 0 && (
                  <div className="mt-2 text-xs">
                    <strong>Sample pitcher names:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {pitchers.slice(0, 3).map(p => <li key={p.id}>{p.name}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Teams to Import:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-200">
              {Object.keys(rosterData.rosters).map(teamName => (
                <div key={teamName} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{teamName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ Important Notes:
            </h3>
            <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>This will update the "Roster" field for all players in the roster assignments</li>
              <li>Player names must match exactly (including year in parentheses)</li>
              <li>Players not found in your database will be listed after import</li>
              <li>Make sure you have imported your hitters and pitchers data first</li>
            </ul>
          </div>

          <button
            onClick={importRosters}
            disabled={importing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Upload className="h-5 w-5" />
            {importing ? 'Importing Rosters...' : 'Import Roster Assignments'}
          </button>

          {result && (
            <div className={`rounded-lg p-4 ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    result.success 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {result.success ? 'Import Successful!' : 'Import Failed'}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    result.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.message}
                  </p>

                  {result.playersNotFound.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-100">
                        Players Not Found ({result.playersNotFound.length}):
                      </h4>
                      <div className="bg-white dark:bg-gray-900 rounded border border-orange-200 dark:border-orange-800 p-3 max-h-60 overflow-y-auto">
                        <ul className="text-xs space-y-1 text-orange-800 dark:text-orange-200">
                          {result.playersNotFound.map((player, idx) => (
                            <li key={idx}>{player}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs mt-2 text-orange-700 dark:text-orange-300">
                        These players may need to be imported first, or their names may not match exactly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Roster Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rosterData.rosters).map(([teamName, teamData]) => (
            <div key={teamName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                {teamName}
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Pitchers: {teamData.pitchers.length}</div>
                <div>Hitters: {teamData.hitters.length}</div>
                <div className="font-semibold">Total: {teamData.pitchers.length + teamData.hitters.length}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
