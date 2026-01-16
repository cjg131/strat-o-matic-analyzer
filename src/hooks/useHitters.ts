import { useState, useEffect } from 'react';
import type { Hitter } from '../types';
import { loadHitters, saveHitters } from '../utils/storage';

export function useHitters() {
  const [hitters, setHitters] = useState<Hitter[]>(loadHitters());

  useEffect(() => {
    saveHitters(hitters);
  }, [hitters]);

  const addHitter = (hitter: Hitter) => {
    setHitters((prev) => [...prev, hitter]);
  };

  const updateHitter = (id: string, updatedHitter: Hitter) => {
    setHitters((prev) =>
      prev.map((hitter) => (hitter.id === id ? updatedHitter : hitter))
    );
  };

  const deleteHitter = (id: string) => {
    setHitters((prev) => prev.filter((hitter) => hitter.id !== id));
  };

  return {
    hitters,
    addHitter,
    updateHitter,
    deleteHitter,
  };
}
