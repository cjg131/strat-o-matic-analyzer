import { useState, useEffect } from 'react';
import type { Pitcher } from '../types';
import { loadPitchers, savePitchers } from '../utils/storage';

export function usePitchers() {
  const [pitchers, setPitchers] = useState<Pitcher[]>(loadPitchers());

  useEffect(() => {
    savePitchers(pitchers);
  }, [pitchers]);

  const addPitcher = (pitcher: Pitcher) => {
    setPitchers((prev) => [...prev, pitcher]);
  };

  const updatePitcher = (id: string, updatedPitcher: Pitcher) => {
    setPitchers((prev) =>
      prev.map((pitcher) => (pitcher.id === id ? updatedPitcher : pitcher))
    );
  };

  const deletePitcher = (id: string) => {
    setPitchers((prev) => prev.filter((pitcher) => pitcher.id !== id));
  };

  return {
    pitchers,
    addPitcher,
    updatePitcher,
    deletePitcher,
  };
}
