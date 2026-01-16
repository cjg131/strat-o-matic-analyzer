import type { Hitter, Pitcher, ScoringWeights, TeamRoster } from '../types';
import { DEFAULT_SCORING_WEIGHTS } from '../types';

const STORAGE_KEYS = {
  HITTERS: 'strat-o-matic-hitters',
  PITCHERS: 'strat-o-matic-pitchers',
  SCORING_WEIGHTS: 'strat-o-matic-scoring-weights',
  BALLPARKS: 'strat-o-matic-ballparks',
} as const;

export function loadHitters(): Hitter[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HITTERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading hitters:', error);
    return [];
  }
}

export function saveHitters(hitters: Hitter[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HITTERS, JSON.stringify(hitters));
  } catch (error) {
    console.error('Error saving hitters:', error);
  }
}

export function loadPitchers(): Pitcher[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PITCHERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading pitchers:', error);
    return [];
  }
}

export function savePitchers(pitchers: Pitcher[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PITCHERS, JSON.stringify(pitchers));
  } catch (error) {
    console.error('Error saving pitchers:', error);
  }
}

export function loadScoringWeights(): ScoringWeights {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCORING_WEIGHTS);
    if (!data) {
      return DEFAULT_SCORING_WEIGHTS;
    }
    
    const stored = JSON.parse(data);
    // Merge stored weights with defaults to ensure new fields are present
    return {
      hitter: {
        ...DEFAULT_SCORING_WEIGHTS.hitter,
        ...stored.hitter,
      },
      pitcher: {
        ...DEFAULT_SCORING_WEIGHTS.pitcher,
        ...stored.pitcher,
      },
    };
  } catch (error) {
    console.error('Error loading scoring weights:', error);
    return DEFAULT_SCORING_WEIGHTS;
  }
}

export function saveScoringWeights(weights: ScoringWeights): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORING_WEIGHTS, JSON.stringify(weights));
  } catch (error) {
    console.error('Error saving scoring weights:', error);
  }
}

export function resetScoringWeights(): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.SCORING_WEIGHTS,
      JSON.stringify(DEFAULT_SCORING_WEIGHTS)
    );
  } catch (error) {
    console.error('Error resetting scoring weights:', error);
  }
}

export function loadBallparks(): any[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BALLPARKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading ballparks:', error);
    return [];
  }
}

export function saveBallparks(ballparks: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BALLPARKS, JSON.stringify(ballparks));
  } catch (error) {
    console.error('Error saving ballparks:', error);
  }
}

export function loadTeam(): TeamRoster | null {
  const data = localStorage.getItem('strat-o-matic-team');
  return data ? JSON.parse(data) : null;
}

export function saveTeam(team: TeamRoster): void {
  localStorage.setItem('strat-o-matic-team', JSON.stringify(team));
}
