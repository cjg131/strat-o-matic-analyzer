import { useState, useEffect } from 'react';
import type { Hitter } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToHitters, 
  saveHitter,
  saveMultipleHitters as saveMultipleHittersToFirestore,
  deleteHitter as deleteHitterFromFirestore,
  clearAllHitters as clearAllHittersFromFirestore 
} from '../services/firestore';

export function useHitters() {
  const { currentUser } = useAuth();
  const [hitters, setHitters] = useState<Hitter[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setHitters([]);
      return;
    }

    const unsubscribe = subscribeToHitters(currentUser.uid, (updatedHitters) => {
      setHitters(updatedHitters);
    });

    return unsubscribe;
  }, [currentUser]);

  const addHitter = async (hitter: Hitter) => {
    if (!currentUser) return;
    await saveHitter(currentUser.uid, hitter);
  };

  const addMultipleHitters = async (hitters: Hitter[]) => {
    if (!currentUser) return;
    await saveMultipleHittersToFirestore(currentUser.uid, hitters);
  };

  const updateHitter = async (_id: string, updatedHitter: Hitter) => {
    if (!currentUser) return;
    await saveHitter(currentUser.uid, updatedHitter);
  };

  const deleteHitter = async (id: string) => {
    if (!currentUser) return;
    await deleteHitterFromFirestore(currentUser.uid, id);
  };

  const clearAllHitters = async () => {
    if (!currentUser) return;
    await clearAllHittersFromFirestore(currentUser.uid);
  };

  return {
    hitters,
    addHitter,
    addMultipleHitters,
    updateHitter,
    deleteHitter,
    clearAllHitters,
  };
}
