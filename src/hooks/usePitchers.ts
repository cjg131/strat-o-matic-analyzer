import { useState, useEffect } from 'react';
import type { Pitcher } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToPitchers, 
  savePitcher, 
  deletePitcher as deletePitcherFromFirestore,
  clearAllPitchers as clearAllPitchersFromFirestore 
} from '../services/firestore';

export function usePitchers() {
  const { currentUser } = useAuth();
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setPitchers([]);
      return;
    }

    const unsubscribe = subscribeToPitchers(currentUser.uid, (updatedPitchers) => {
      setPitchers(updatedPitchers);
    });

    return unsubscribe;
  }, [currentUser]);

  const addPitcher = async (pitcher: Pitcher) => {
    if (!currentUser) return;
    await savePitcher(currentUser.uid, pitcher);
  };

  const updatePitcher = async (_id: string, updatedPitcher: Pitcher) => {
    if (!currentUser) return;
    await savePitcher(currentUser.uid, updatedPitcher);
  };

  const deletePitcher = async (id: string) => {
    if (!currentUser) return;
    await deletePitcherFromFirestore(currentUser.uid, id);
  };

  const clearAllPitchers = async () => {
    if (!currentUser) return;
    await clearAllPitchersFromFirestore(currentUser.uid);
  };

  return {
    pitchers,
    addPitcher,
    updatePitcher,
    deletePitcher,
    clearAllPitchers,
  };
}
