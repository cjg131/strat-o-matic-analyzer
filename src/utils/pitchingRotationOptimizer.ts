import type { Pitcher } from '../types';

export interface OptimizedRotation {
  starters: RotationPitcher[];
  bullpen: BullpenPitcher[];
}

export interface RotationPitcher {
  id: string;
  name: string;
  season: string;
  position: number;
  hand: string;
  endurance: string;
  wins: number;
  losses: number;
  era: number;
  whip: number;
  ip: number;
  so: number;
}

export interface BullpenPitcher {
  id: string;
  name: string;
  season: string;
  hand: string;
  endurance: string;
  era: number;
  whip: number;
  ip: number;
  so: number;
  role: string; // 'Closer', 'Setup', 'Middle', 'Long'
}

function calculateERA(pitcher: Pitcher): number {
  if (!pitcher.inningsPitched || pitcher.inningsPitched === 0) return 999;
  return (pitcher.earnedRuns * 9) / pitcher.inningsPitched;
}

function calculateWHIP(pitcher: Pitcher): number {
  if (!pitcher.inningsPitched || pitcher.inningsPitched === 0) return 999;
  return (pitcher.walks + pitcher.hitsAllowed) / pitcher.inningsPitched;
}

function calculateWins(pitcher: Pitcher): number {
  if (!pitcher.gamesStarted) return 0;
  const era = calculateERA(pitcher);
  if (era < 3.0) return Math.floor(pitcher.gamesStarted * 0.65);
  if (era < 4.0) return Math.floor(pitcher.gamesStarted * 0.50);
  return Math.floor(pitcher.gamesStarted * 0.35);
}

function calculateLosses(pitcher: Pitcher): number {
  if (!pitcher.gamesStarted) return 0;
  const wins = calculateWins(pitcher);
  return Math.max(0, pitcher.gamesStarted - wins - Math.floor(pitcher.gamesStarted * 0.15));
}

function getStarterScore(pitcher: Pitcher): number {
  const era = calculateERA(pitcher);
  const whip = calculateWHIP(pitcher);
  const kPer9 = pitcher.inningsPitched > 0 ? (pitcher.strikeouts * 9) / pitcher.inningsPitched : 0;
  
  // Lower score is better
  // ERA is most important, then WHIP, then strikeouts
  const eraScore = era * 3;
  const whipScore = whip * 2;
  const kScore = Math.max(0, 9 - kPer9); // Penalty for low K rate
  
  return eraScore + whipScore + kScore;
}

function getRelieverScore(pitcher: Pitcher): number {
  const era = calculateERA(pitcher);
  const whip = calculateWHIP(pitcher);
  const kPer9 = pitcher.inningsPitched > 0 ? (pitcher.strikeouts * 9) / pitcher.inningsPitched : 0;
  
  // For relievers, strikeouts matter more
  const eraScore = era * 2.5;
  const whipScore = whip * 2;
  const kScore = Math.max(0, 10 - kPer9);
  
  return eraScore + whipScore + kScore;
}

function assignBullpenRole(pitcher: Pitcher, index: number): string {
  const endurance = pitcher.endurance?.toUpperCase() || '';
  
  // Closers have 'C' rating
  if (endurance.includes('C')) return 'Closer';
  
  // Based on position in sorted list
  if (index === 0 && !endurance.includes('C')) return 'Closer'; // Best reliever if no closer
  if (index === 1) return 'Setup';
  if (index < 4) return 'Middle';
  return 'Long';
}

export function generateOptimizedRotation(pitchers: Pitcher[]): OptimizedRotation {
  // Separate starters and relievers
  const starters = pitchers.filter(p => {
    const end = p.endurance?.toUpperCase() || '';
    return end.includes('S'); // Has starter rating
  });
  
  const relievers = pitchers.filter(p => {
    const end = p.endurance?.toUpperCase() || '';
    return !end.includes('S') && (end.includes('R') || end.includes('C'));
  });
  
  // Sort starters by composite score (ERA, WHIP, K/9)
  const sortedStarters = [...starters].sort((a, b) => getStarterScore(a) - getStarterScore(b));
  
  // Build rotation (top 5 starters)
  const rotationPitchers: RotationPitcher[] = sortedStarters.slice(0, 5).map((p, idx) => ({
    id: p.id,
    name: p.name,
    season: p.season,
    position: idx + 1,
    hand: p.throwingArm || 'R',
    endurance: p.endurance || '',
    wins: calculateWins(p),
    losses: calculateLosses(p),
    era: calculateERA(p),
    whip: calculateWHIP(p),
    ip: p.inningsPitched || 0,
    so: p.strikeouts || 0
  }));
  
  // Sort relievers by composite score
  const sortedRelievers = [...relievers].sort((a, b) => getRelieverScore(a) - getRelieverScore(b));
  
  // Build bullpen with role assignments
  const bullpenPitchers: BullpenPitcher[] = sortedRelievers.map((p, idx) => ({
    id: p.id,
    name: p.name,
    season: p.season,
    hand: p.throwingArm || 'R',
    endurance: p.endurance || '',
    era: calculateERA(p),
    whip: calculateWHIP(p),
    ip: p.inningsPitched || 0,
    so: p.strikeouts || 0,
    role: assignBullpenRole(p, idx)
  }));
  
  return {
    starters: rotationPitchers,
    bullpen: bullpenPitchers
  };
}
