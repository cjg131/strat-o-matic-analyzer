import type { Hitter } from '../types';

export const REQUIRED_POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

export function checkPositionCoverage(hitters: Hitter[]): {
  covered: string[];
  missing: string[];
  allCovered: boolean;
} {
  const covered = new Set<string>();
  
  for (const hitter of hitters) {
    const positions = extractPositions(hitter.positions || '');
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
  return extractPositions(hitter.positions || '');
}

function extractPositions(positionString: string): string[] {
  // Position strings look like: "rf-4(0)e8 / lf-3e8 / cf-4e8 / 2b-4e47"
  // We need to extract just the position codes: RF, LF, CF, 2B
  
  const positions: string[] = [];
  const parts = positionString.split('/').map(p => p.trim());
  
  for (const part of parts) {
    // Extract position code before the dash (e.g., "rf-4(0)e8" -> "rf")
    const match = part.match(/^([a-z0-9]+)-/i);
    if (match) {
      const pos = match[1].toUpperCase();
      positions.push(pos);
    }
  }
  
  return positions;
}
