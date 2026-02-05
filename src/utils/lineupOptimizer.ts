import type { Hitter } from '../types';
import { calculateHitterStats } from './calculations';
import type { HitterScoringWeights } from '../types';

interface HitterWithStats extends Hitter {
  singles: number;
  fantasyPoints: number;
  pointsPer600PA: number;
  pointsPerGame: number;
  pointsPerDollar: number;
}

interface OptimizedLineup {
  vsLHP: LineupPlayer[];
  vsRHP: LineupPlayer[];
}

interface LineupPlayer {
  id: string;
  name: string;
  position: string;
  battingOrder: number;
  balance: string;
  ba: number;
  obp: number;
  slg: number;
}

function getPlatoonScore(balance: string | undefined, pitcherHand: 'L' | 'R'): number {
  if (!balance || balance === 'E') return 1.0;
  
  const match = balance.match(/(\d+)([LR])/);
  if (!match) return 1.0;
  
  const strength = parseInt(match[1]);
  const batterHand = match[2];
  
  if (pitcherHand === 'L' && batterHand === 'R') {
    return 1.0 + (strength * 0.02);
  }
  if (pitcherHand === 'R' && batterHand === 'L') {
    return 1.0 + (strength * 0.02);
  }
  
  return 1.0 - (strength * 0.02);
}

function getDefensiveRating(hitter: HitterWithStats, position: string): number {
  if (!hitter.defensivePositions || !Array.isArray(hitter.defensivePositions)) {
    return 999;
  }
  
  const posLower = position.toLowerCase();
  const defPos = hitter.defensivePositions.find(dp => dp.position === posLower);
  
  if (!defPos) return 999;
  
  return (defPos.range * 2) + defPos.error;
}

function getBestPosition(hitter: HitterWithStats, availablePositions: string[]): string | null {
  let bestPos = null;
  let bestRating = 999;
  
  for (const pos of availablePositions) {
    const rating = getDefensiveRating(hitter, pos);
    if (rating < bestRating) {
      bestRating = rating;
      bestPos = pos;
    }
  }
  
  return bestPos;
}

function optimizeLineupOrder(hitters: HitterWithStats[], pitcherHand: 'L' | 'R'): HitterWithStats[] {
  if (hitters.length === 0) return [];
  
  const sorted = [...hitters].sort((a, b) => {
    const aOPS = (a.obp || 0) + (a.slg || 0);
    const bOPS = (b.obp || 0) + (b.slg || 0);
    const aPlatoonOPS = aOPS * getPlatoonScore(a.balance, pitcherHand);
    const bPlatoonOPS = bOPS * getPlatoonScore(b.balance, pitcherHand);
    return bPlatoonOPS - aPlatoonOPS;
  });
  
  const allPositions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
  const playerAssignments = new Map<string, string>();
  const filledPositions = new Set<string>();
  
  const positionPriority = ['C', 'SS', 'CF', '2B', '3B', '1B', 'LF', 'RF'];
  
  for (const position of positionPriority) {
    let bestPlayer: HitterWithStats | null = null;
    let bestDefRating = 999;
    
    for (const player of sorted) {
      if (playerAssignments.has(player.id)) continue;
      
      const defRating = getDefensiveRating(player, position);
      if (defRating < bestDefRating) {
        bestDefRating = defRating;
        bestPlayer = player;
      }
    }
    
    if (bestPlayer) {
      playerAssignments.set(bestPlayer.id, position);
      filledPositions.add(position);
    }
  }
  
  const selectedPlayers = sorted.filter(h => playerAssignments.has(h.id));
  
  while (selectedPlayers.length < 8 && selectedPlayers.length < sorted.length) {
    const nextBest = sorted.find(h => !playerAssignments.has(h.id));
    if (nextBest) {
      selectedPlayers.push(nextBest);
      const openPositions = allPositions.filter(p => !filledPositions.has(p));
      const bestPos = getBestPosition(nextBest, openPositions);
      if (bestPos) {
        playerAssignments.set(nextBest.id, bestPos);
        filledPositions.add(bestPos);
      }
    } else {
      break;
    }
  }
  
  const top8 = selectedPlayers;
  const lineup: HitterWithStats[] = [];
  
  const byOBP = [...top8].sort((a, b) => {
    const aAdj = (a.obp || 0) * getPlatoonScore(a.balance, pitcherHand);
    const bAdj = (b.obp || 0) * getPlatoonScore(b.balance, pitcherHand);
    return bAdj - aAdj;
  });
  lineup.push(byOBP[0]);
  lineup.push(byOBP[1]);
  
  const remaining = top8.filter(h => !lineup.includes(h));
  const bySLG = [...remaining].sort((a, b) => {
    const aAdj = (a.slg || 0) * getPlatoonScore(a.balance, pitcherHand);
    const bAdj = (b.slg || 0) * getPlatoonScore(b.balance, pitcherHand);
    return bAdj - aAdj;
  });
  lineup.push(bySLG[0]);
  lineup.push(bySLG[1]);
  lineup.push(bySLG[2]);
  
  const final = top8.filter(h => !lineup.includes(h));
  lineup.push(...final);
  
  return lineup;
}

export function generateOptimizedLineups(hitters: Hitter[], weights: HitterScoringWeights): OptimizedLineup {
  const hittersWithStats: HitterWithStats[] = hitters.map(h => calculateHitterStats(h, weights));
  
  const vsLHPLineup = optimizeLineupOrder(hittersWithStats, 'L');
  const vsRHPLineup = optimizeLineupOrder(hittersWithStats, 'R');
  
  const convertToLineupPlayer = (hitter: HitterWithStats, order: number, position: string): LineupPlayer => ({
    id: hitter.id,
    name: hitter.name,
    position,
    battingOrder: order,
    balance: hitter.balance || 'E',
    ba: hitter.ba || 0,
    obp: hitter.obp || 0,
    slg: hitter.slg || 0,
  });
  
  const vsLHP: LineupPlayer[] = vsLHPLineup.map((h, idx) => {
    const pos = h.defensivePositions?.[0]?.position?.toUpperCase() || h.positions?.split(',')[0]?.trim() || 'DH';
    return convertToLineupPlayer(h, idx + 1, pos);
  });
  
  const vsRHP: LineupPlayer[] = vsRHPLineup.map((h, idx) => {
    const pos = h.defensivePositions?.[0]?.position?.toUpperCase() || h.positions?.split(',')[0]?.trim() || 'DH';
    return convertToLineupPlayer(h, idx + 1, pos);
  });
  
  return { vsLHP, vsRHP };
}
