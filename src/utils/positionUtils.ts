import type { Hitter } from '../types';

export const REQUIRED_POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

export function checkPositionCoverage(hitters: Hitter[]): {
  covered: string[];
  missing: string[];
  allCovered: boolean;
} {
  const covered = new Set<string>();
  
  for (const hitter of hitters) {
    const positions = hitter.positions?.toUpperCase().split(/[\s,/]+/).filter(p => p.length > 0) || [];
    for (const pos of positions) {
      if (REQUIRED_POSITIONS.includes(pos)) {
        covered.add(pos);
      }
    }
  }
  
  const missing = REQUIRED_POSITIONS.filter(pos => !covered.has(pos));
  
  return {
    covered: Array.from(covered),
    missing,
    allCovered: missing.length === 0,
  };
}

export function getPlayerPositions(hitter: Hitter): string[] {
  return hitter.positions?.toUpperCase().split(/[\s,/]+/).filter(p => p.length > 0) || [];
}
