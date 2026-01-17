import { useState, useEffect } from 'react';
import type { Ballpark } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToBallparks, 
  saveMultipleBallparks as saveMultipleBallparksToFirestore,
  deleteBallpark as deleteBallparkFromFirestore,
  clearAllBallparks as clearAllBallparksFromFirestore 
} from '../services/firestore';

export function useBallparks() {
  const { currentUser } = useAuth();
  const [ballparks, setBallparks] = useState<Ballpark[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setBallparks([]);
      return;
    }

    const unsubscribe = subscribeToBallparks(currentUser.uid, (updatedBallparks) => {
      setBallparks(updatedBallparks);
    });

    return unsubscribe;
  }, [currentUser]);

  const addBallpark = async (ballpark: Ballpark) => {
    if (!currentUser) return;
    await saveMultipleBallparksToFirestore(currentUser.uid, [...ballparks, ballpark]);
  };

  const addMultipleBallparks = async (newBallparks: Ballpark[]) => {
    if (!currentUser) return;
    await saveMultipleBallparksToFirestore(currentUser.uid, [...ballparks, ...newBallparks]);
  };

  const updateBallpark = async (id: string, updatedBallpark: Ballpark) => {
    if (!currentUser) return;
    const updated = ballparks.map((b) => (b.id === id ? updatedBallpark : b));
    await saveMultipleBallparksToFirestore(currentUser.uid, updated);
  };

  const deleteBallpark = async (id: string) => {
    if (!currentUser) return;
    await deleteBallparkFromFirestore(currentUser.uid, id);
  };

  const clearAllBallparks = async () => {
    if (!currentUser) return;
    await clearAllBallparksFromFirestore(currentUser.uid);
  };

  return {
    ballparks,
    addBallpark,
    addMultipleBallparks,
    updateBallpark,
    deleteBallpark,
    clearAllBallparks,
  };
}
