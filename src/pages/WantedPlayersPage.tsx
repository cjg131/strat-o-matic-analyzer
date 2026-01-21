import { useState } from 'react';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { useWantedPlayers } from '../hooks/useWantedPlayers';
import { formatCurrency } from '../utils/calculations';

export function WantedPlayersPage() {
  const { wantedPlayers, loading, removePlayer, updateNotes } = useWantedPlayers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const handleEditNotes = (id: string, currentNotes: string) => {
    setEditingId(id);
    setEditNotes(currentNotes || '');
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await updateNotes(id, editNotes);
      setEditingId(null);
    } catch (error) {
      alert('Failed to update notes');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const handleRemove = async (id: string, playerName: string) => {
    if (confirm(`Remove ${playerName} from wanted list?`)) {
      try {
        await removePlayer(id);
      } catch (error) {
        alert('Failed to remove player');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600 dark:text-gray-300">Loading wanted players...</div>
      </div>
    );
  }

  const hitters = wantedPlayers.filter(p => p.playerType === 'hitter');
  const pitchers = wantedPlayers.filter(p => p.playerType === 'pitcher');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Wanted Players
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track players you're interested in acquiring
        </p>
      </div>

      {wantedPlayers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No wanted players yet. Add players from the Hitters or Pitchers pages using the star icon.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hitters Section */}
          {hitters.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-700 px-6 py-3">
                <h2 className="text-xl font-bold text-white">Hitters ({hitters.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Season</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-4 py-3 text-left">Roster</th>
                      <th className="px-4 py-3 text-left">Positions</th>
                      <th className="px-4 py-3 text-right">Salary</th>
                      <th className="px-4 py-3 text-right">FP</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {hitters.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{player.playerName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{player.season}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{player.team || '-'}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          <span className={!player.roster ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                            {player.roster || 'FA'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{player.positions || '-'}</td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-mono">
                          {formatCurrency(player.salary)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          {player.fantasyPoints?.toFixed(1) || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {editingId === player.id ? (
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="Add notes..."
                            />
                          ) : (
                            <span className="text-sm">{player.notes || '-'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {editingId === player.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveNotes(player.id)}
                                  className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                  title="Save notes"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditNotes(player.id, player.notes || '')}
                                  className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Edit notes"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemove(player.id, player.playerName)}
                                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Remove from wanted list"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pitchers Section */}
          {pitchers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
                <h2 className="text-xl font-bold text-white">Pitchers ({pitchers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Season</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-4 py-3 text-left">Roster</th>
                      <th className="px-4 py-3 text-right">Salary</th>
                      <th className="px-4 py-3 text-right">FP</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pitchers.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{player.playerName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{player.season}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{player.team || '-'}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          <span className={!player.roster ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                            {player.roster || 'FA'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-mono">
                          {formatCurrency(player.salary)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          {player.fantasyPoints?.toFixed(1) || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {editingId === player.id ? (
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="Add notes..."
                            />
                          ) : (
                            <span className="text-sm">{player.notes || '-'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {editingId === player.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveNotes(player.id)}
                                  className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                  title="Save notes"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditNotes(player.id, player.notes || '')}
                                  className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Edit notes"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemove(player.id, player.playerName)}
                                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Remove from wanted list"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
