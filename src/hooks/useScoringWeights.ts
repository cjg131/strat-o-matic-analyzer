import { useState, useEffect } from 'react';
import type { ScoringWeights } from '../types';
import { loadScoringWeights, saveScoringWeights, resetScoringWeights } from '../utils/storage';
import { DEFAULT_SCORING_WEIGHTS } from '../types';

export function useScoringWeights() {
  const [weights, setWeights] = useState<ScoringWeights>(loadScoringWeights());

  useEffect(() => {
    saveScoringWeights(weights);
  }, [weights]);

  const updateWeights = (newWeights: ScoringWeights) => {
    setWeights(newWeights);
  };

  const resetToDefaults = () => {
    resetScoringWeights();
    setWeights(DEFAULT_SCORING_WEIGHTS);
  };

  return {
    weights,
    updateWeights,
    resetToDefaults,
  };
}
