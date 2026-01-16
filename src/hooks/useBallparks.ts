import { useState, useEffect } from 'react';
import type { Ballpark } from '../types';
import { loadBallparks, saveBallparks } from '../utils/storage';

export function useBallparks() {
  const [ballparks, setBallparks] = useState<Ballpark[]>(loadBallparks());

  useEffect(() => {
    saveBallparks(ballparks);
  }, [ballparks]);

  const addBallpark = (ballpark: Ballpark) => {
    setBallparks([...ballparks, ballpark]);
  };

  const addMultipleBallparks = (newBallparks: Ballpark[]) => {
    setBallparks([...ballparks, ...newBallparks]);
  };

  const updateBallpark = (id: string, updatedBallpark: Ballpark) => {
    setBallparks(ballparks.map((b) => (b.id === id ? updatedBallpark : b)));
  };

  const deleteBallpark = (id: string) => {
    setBallparks(ballparks.filter((b) => b.id !== id));
  };

  const clearAllBallparks = () => {
    setBallparks([]);
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
