import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getWantedPlayers, 
  addWantedPlayer, 
  removeWantedPlayer, 
  updateWantedPlayerNotes 
} from '../services/firestore';
import type { WantedPlayer } from '../types/wantedPlayers';

export function useWantedPlayers() {
  const [wantedPlayers, setWantedPlayers] = useState<WantedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadWantedPlayers();
    } else {
      setWantedPlayers([]);
      setLoading(false);
    }
  }, [currentUser]);

  const loadWantedPlayers = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const players = await getWantedPlayers(currentUser.uid);
      setWantedPlayers(players);
    } catch (error) {
      console.error('Error loading wanted players:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (player: Omit<WantedPlayer, 'id' | 'addedDate'>) => {
    if (!currentUser) return;

    const newPlayer: WantedPlayer = {
      ...player,
      id: `${player.playerId}-${Date.now()}`,
      addedDate: new Date().toISOString(),
    };

    try {
      await addWantedPlayer(currentUser.uid, newPlayer);
      setWantedPlayers(prev => [...prev, newPlayer]);
    } catch (error) {
      console.error('Error adding wanted player:', error);
      throw error;
    }
  };

  const removePlayer = async (id: string) => {
    if (!currentUser) return;

    try {
      await removeWantedPlayer(currentUser.uid, id);
      setWantedPlayers(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error removing wanted player:', error);
      throw error;
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    if (!currentUser) return;

    try {
      await updateWantedPlayerNotes(currentUser.uid, id, notes);
      setWantedPlayers(prev => 
        prev.map(p => p.id === id ? { ...p, notes } : p)
      );
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  };

  const isPlayerWanted = (playerId: string): boolean => {
    return wantedPlayers.some(p => p.playerId === playerId);
  };

  return {
    wantedPlayers,
    loading,
    addPlayer,
    removePlayer,
    updateNotes,
    isPlayerWanted,
  };
}
