import { useState, useEffect } from 'react';
import type { ScoringWeights } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_SCORING_WEIGHTS } from '../types';
import { 
  subscribeToScoringWeights, 
  saveScoringWeights as saveScoringWeightsToFirestore 
} from '../services/firestore';

export function useScoringWeights() {
  const { currentUser } = useAuth();
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);

  useEffect(() => {
    if (!currentUser) {
      setWeights(DEFAULT_SCORING_WEIGHTS);
      return;
    }

    const unsubscribe = subscribeToScoringWeights(currentUser.uid, (updatedWeights) => {
      if (updatedWeights) {
        setWeights(updatedWeights);
      } else {
        // Initialize with defaults if no weights exist
        saveScoringWeightsToFirestore(currentUser.uid, DEFAULT_SCORING_WEIGHTS);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const updateWeights = async (newWeights: ScoringWeights) => {
    if (!currentUser) return;
    await saveScoringWeightsToFirestore(currentUser.uid, newWeights);
  };

  const resetToDefaults = async () => {
    if (!currentUser) return;
    await saveScoringWeightsToFirestore(currentUser.uid, DEFAULT_SCORING_WEIGHTS);
  };

  return {
    weights,
    updateWeights,
    resetToDefaults,
  };
}
