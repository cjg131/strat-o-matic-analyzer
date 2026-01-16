import type { Hitter, Pitcher, HitterWithStats, PitcherWithStats } from '../types';

export interface AutoBuildStrategy {
  // Hitter preferences (0-100 scale)
  speedWeight: number;
  powerWeight: number;
  defenseWeight: number;
  onBaseWeight: number;
  
  // Pitcher preferences (0-100 scale)
  starterWeight: number;
  relieverWeight: number;
  closerWeight: number;
  strikeoutWeight: number;
  
  // Budget allocation (0-100 scale)
  hitterBudgetPercent: number;
  pitcherBudgetPercent: number;
  
  // Roster composition
  targetPitchers: number; // 10-12
  targetCanStart: number; // At least 5 who can start
  targetCanRelieve: number; // At least 4 who can relieve
  targetPureRelievers: number; // At least 4 pure relievers
  targetHitters: number; // 13-17
}

export const DEFAULT_STRATEGY: AutoBuildStrategy = {
  speedWeight: 50,
  powerWeight: 50,
  defenseWeight: 50,
  onBaseWeight: 50,
  starterWeight: 60,
  relieverWeight: 40,
  closerWeight: 30,
  strikeoutWeight: 50,
  hitterBudgetPercent: 55,
  pitcherBudgetPercent: 45,
  targetPitchers: 11,
  targetCanStart: 6,
  targetCanRelieve: 5,
  targetPureRelievers: 4,
  targetHitters: 15,
};

interface ScoredPlayer {
  player: HitterWithStats | PitcherWithStats;
  score: number;
  isPitcher: boolean;
}

export function autoSelectTeam(
  hitters: HitterWithStats[],
  pitchers: PitcherWithStats[],
  strategy: AutoBuildStrategy,
  salaryCap: number
): { selectedHitters: Hitter[]; selectedPitchers: Pitcher[] } {
  // Score all players with value per dollar consideration
  const scoredHitters = hitters.map((h) => ({
    player: h,
    score: scoreHitter(h, strategy),
    valuePerDollar: scoreHitter(h, strategy) / (h.salary || 1),
    isPitcher: false,
  }));

  const scoredPitchers = pitchers.map((p) => ({
    player: p,
    score: scorePitcher(p, strategy),
    valuePerDollar: scorePitcher(p, strategy) / (p.salary || 1),
    isPitcher: true,
  }));

  // Use flexible budget allocation to maximize team value
  const { selectedHitters, selectedPitchers } = selectOptimalTeam(
    scoredHitters,
    scoredPitchers,
    strategy,
    salaryCap
  );

  return {
    selectedHitters: selectedHitters.map((sh) => sh.player as Hitter),
    selectedPitchers: selectedPitchers.map((sp) => sp.player as Pitcher),
  };
}

function selectOptimalTeam(
  scoredHitters: (ScoredPlayer & { valuePerDollar: number })[],
  scoredPitchers: (ScoredPlayer & { valuePerDollar: number })[],
  strategy: AutoBuildStrategy,
  salaryCap: number
): { selectedHitters: ScoredPlayer[]; selectedPitchers: ScoredPlayer[] } {
  const selectedHitters: ScoredPlayer[] = [];
  const selectedPitchers: ScoredPlayer[] = [];
  let totalSpent = 0;

  // Sort by value per dollar for optimal selection
  const sortedHitters = [...scoredHitters].sort((a, b) => b.valuePerDollar - a.valuePerDollar);
  const sortedPitchers = [...scoredPitchers].sort((a, b) => b.valuePerDollar - a.valuePerDollar);

  // Track requirements
  let canStartCount = 0;
  let canRelieveCount = 0;
  let pureRelieverCount = 0;
  const coveredPositions = new Set<string>();
  const REQUIRED_POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

  // Phase 1: Fill minimum requirements with best value players
  // First, ensure all 9 positions are covered
  for (const requiredPos of REQUIRED_POSITIONS) {
    if (coveredPositions.has(requiredPos)) continue;
    
    for (const sh of sortedHitters) {
      if (selectedHitters.includes(sh)) continue;
      const hitter = sh.player as HitterWithStats;
      const positions = hitter.positions?.toUpperCase().split(/[\s,/]+/).filter(p => p.length > 0) || [];
      
      if (positions.includes(requiredPos)) {
        if (totalSpent + hitter.salary <= salaryCap * 1.05) { // Allow 5% overage for requirements
          selectedHitters.push(sh);
          totalSpent += hitter.salary;
          positions.forEach(pos => coveredPositions.add(pos));
          break;
        }
      }
    }
  }

  // Ensure we have at least 2 catchers total
  const catcherCount = selectedHitters.filter(sh => {
    const hitter = sh.player as HitterWithStats;
    return hitter.positions?.toUpperCase().includes('C');
  }).length;

  if (catcherCount < 2) {
    for (const sh of sortedHitters) {
      if (selectedHitters.includes(sh)) continue;
      const hitter = sh.player as HitterWithStats;
      if (hitter.positions?.toUpperCase().includes('C')) {
        if (totalSpent + hitter.salary <= salaryCap * 1.05) {
          selectedHitters.push(sh);
          totalSpent += hitter.salary;
          if (selectedHitters.filter(s => (s.player as HitterWithStats).positions?.toUpperCase().includes('C')).length >= 2) {
            break;
          }
        }
      }
    }
  }

  // Ensure minimum pitchers with required roles
  for (const sp of sortedPitchers) {
    const pitcher = sp.player as PitcherWithStats;
    const endurance = pitcher.endurance?.toUpperCase() || '';
    const hasStarterRole = endurance.includes('S');
    const hasRelieverRole = endurance.includes('R') || endurance.includes('C');
    const isPureReliever = hasRelieverRole && !hasStarterRole;

    const needsStarter = canStartCount < strategy.targetCanStart && hasStarterRole;
    const needsReliever = canRelieveCount < strategy.targetCanRelieve && hasRelieverRole;
    const needsPureReliever = pureRelieverCount < strategy.targetPureRelievers && isPureReliever;

    if ((needsStarter || needsReliever || needsPureReliever) && selectedPitchers.length < strategy.targetPitchers) {
      if (totalSpent + pitcher.salary <= salaryCap * 1.05) { // Allow 5% overage for requirements
        selectedPitchers.push(sp);
        totalSpent += pitcher.salary;
        if (hasStarterRole) canStartCount++;
        if (hasRelieverRole) canRelieveCount++;
        if (isPureReliever) pureRelieverCount++;
      }
    }
  }

  // Phase 2: Fill remaining slots with best value players (pitchers and hitters combined)
  const allRemaining = [
    ...sortedHitters.filter(h => !selectedHitters.includes(h)),
    ...sortedPitchers.filter(p => !selectedPitchers.includes(p))
  ].sort((a, b) => b.valuePerDollar - a.valuePerDollar);

  for (const player of allRemaining) {
    const salary = (player.player as any).salary || 0;
    
    if (totalSpent + salary > salaryCap) continue;

    if (player.isPitcher) {
      if (selectedPitchers.length < strategy.targetPitchers) {
        selectedPitchers.push(player);
        totalSpent += salary;
      }
    } else {
      if (selectedHitters.length < strategy.targetHitters) {
        selectedHitters.push(player);
        totalSpent += salary;
      }
    }
  }

  return { selectedHitters, selectedPitchers };
}

function scoreHitter(hitter: HitterWithStats, strategy: AutoBuildStrategy): number {
  let score = 0;

  // Base fantasy points
  score += hitter.fantasyPoints * 0.3;

  // Speed component (SB, triples)
  const speedScore = (hitter.stolenBases * 3 + hitter.triples * 2) / (hitter.games || 1);
  score += speedScore * (strategy.speedWeight / 100) * 50;

  // Power component (HR, doubles)
  const powerScore = (hitter.homeRuns * 4 + hitter.doubles * 2) / (hitter.games || 1);
  score += powerScore * (strategy.powerWeight / 100) * 50;

  // Defense component (range and errors)
  const defenseScore = (6 - hitter.fieldingRange) * 2 - hitter.fieldingError * 0.5;
  score += defenseScore * (strategy.defenseWeight / 100) * 10;

  // On-base component (walks, HBP)
  const onBaseScore = (hitter.walks + hitter.hitByPitch) / (hitter.games || 1);
  score += onBaseScore * (strategy.onBaseWeight / 100) * 30;

  // Value factor (points per dollar)
  score += hitter.pointsPerDollar * 2;

  return score;
}

function scorePitcher(pitcher: PitcherWithStats, strategy: AutoBuildStrategy): number {
  let score = 0;

  // Base fantasy points
  score += pitcher.fantasyPoints * 0.3;

  const endurance = pitcher.endurance?.toUpperCase() || '';
  const isStarter = endurance.startsWith('S');
  const isReliever = endurance.startsWith('R') || endurance.startsWith('C');
  const isCloser = endurance.startsWith('C');

  // Role-based scoring
  if (isStarter) {
    score += (strategy.starterWeight / 100) * 100;
    score += pitcher.pointsPerStart * 5;
  }
  
  if (isReliever) {
    score += (strategy.relieverWeight / 100) * 80;
  }
  
  if (isCloser) {
    score += (strategy.closerWeight / 100) * 60;
  }

  // Strikeout rate
  const kRate = pitcher.inningsPitched > 0 ? pitcher.strikeouts / pitcher.inningsPitched : 0;
  score += kRate * (strategy.strikeoutWeight / 100) * 100;

  // Efficiency (IP, low walks/hits)
  const whip = pitcher.inningsPitched > 0 
    ? (pitcher.walks + pitcher.hitsAllowed) / pitcher.inningsPitched 
    : 999;
  score += (2 - Math.min(whip, 2)) * 50;

  // Value factor
  score += pitcher.pointsPerDollar * 2;

  return score;
}
