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

  // Sort by hybrid score: 60% raw score + 40% value per dollar (normalized)
  const maxHitterScore = Math.max(...scoredHitters.map(h => h.score));
  const maxHitterValue = Math.max(...scoredHitters.map(h => h.valuePerDollar));
  const sortedHitters = [...scoredHitters].sort((a, b) => {
    const aHybrid = (a.score / maxHitterScore) * 0.6 + (a.valuePerDollar / maxHitterValue) * 0.4;
    const bHybrid = (b.score / maxHitterScore) * 0.6 + (b.valuePerDollar / maxHitterValue) * 0.4;
    return bHybrid - aHybrid;
  });
  
  const maxPitcherScore = Math.max(...scoredPitchers.map(p => p.score));
  const maxPitcherValue = Math.max(...scoredPitchers.map(p => p.valuePerDollar));
  const sortedPitchers = [...scoredPitchers].sort((a, b) => {
    const aHybrid = (a.score / maxPitcherScore) * 0.6 + (a.valuePerDollar / maxPitcherValue) * 0.4;
    const bHybrid = (b.score / maxPitcherScore) * 0.6 + (b.valuePerDollar / maxPitcherValue) * 0.4;
    return bHybrid - aHybrid;
  });

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
  // Priority 1: Pure relievers (most restrictive requirement)
  while (pureRelieverCount < strategy.targetPureRelievers && selectedPitchers.length < strategy.targetPitchers) {
    let added = false;
    for (const sp of sortedPitchers) {
      if (selectedPitchers.includes(sp)) continue;
      const pitcher = sp.player as PitcherWithStats;
      const endurance = pitcher.endurance?.toUpperCase() || '';
      const hasStarterRole = endurance.includes('S');
      const hasRelieverRole = endurance.includes('R') || endurance.includes('C');
      const isPureReliever = hasRelieverRole && !hasStarterRole;

      if (isPureReliever && totalSpent + pitcher.salary <= salaryCap * 1.1) {
        selectedPitchers.push(sp);
        totalSpent += pitcher.salary;
        pureRelieverCount++;
        canRelieveCount++;
        added = true;
        break;
      }
    }
    if (!added) break;
  }

  // Priority 2: Who can start
  while (canStartCount < strategy.targetCanStart && selectedPitchers.length < strategy.targetPitchers) {
    let added = false;
    for (const sp of sortedPitchers) {
      if (selectedPitchers.includes(sp)) continue;
      const pitcher = sp.player as PitcherWithStats;
      const endurance = pitcher.endurance?.toUpperCase() || '';
      const hasStarterRole = endurance.includes('S');
      const hasRelieverRole = endurance.includes('R') || endurance.includes('C');

      if (hasStarterRole && totalSpent + pitcher.salary <= salaryCap * 1.1) {
        selectedPitchers.push(sp);
        totalSpent += pitcher.salary;
        canStartCount++;
        if (hasRelieverRole) canRelieveCount++;
        added = true;
        break;
      }
    }
    if (!added) break;
  }

  // Priority 3: Who can relieve
  while (canRelieveCount < strategy.targetCanRelieve && selectedPitchers.length < strategy.targetPitchers) {
    let added = false;
    for (const sp of sortedPitchers) {
      if (selectedPitchers.includes(sp)) continue;
      const pitcher = sp.player as PitcherWithStats;
      const endurance = pitcher.endurance?.toUpperCase() || '';
      const hasRelieverRole = endurance.includes('R') || endurance.includes('C');

      if (hasRelieverRole && totalSpent + pitcher.salary <= salaryCap * 1.1) {
        selectedPitchers.push(sp);
        totalSpent += pitcher.salary;
        canRelieveCount++;
        added = true;
        break;
      }
    }
    if (!added) break;
  }

  // Phase 2: Fill remaining slots with best available players
  const allRemaining = [
    ...sortedHitters.filter(h => !selectedHitters.includes(h)),
    ...sortedPitchers.filter(p => !selectedPitchers.includes(p))
  ].sort((a, b) => b.score - a.score); // Sort by raw score for filling

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

  // Phase 3: Upgrade players with remaining budget
  // Try to replace lower-scored players with higher-scored ones if budget allows
  const budgetRemaining = salaryCap - totalSpent;
  
  if (budgetRemaining > 10000) { // If we have significant budget left
    // Sort current team by score (lowest first for replacement candidates)
    const sortedCurrentHitters = [...selectedHitters].sort((a, b) => a.score - b.score);
    const sortedCurrentPitchers = [...selectedPitchers].sort((a, b) => a.score - b.score);
    
    // Try to upgrade hitters
    for (let i = 0; i < sortedCurrentHitters.length; i++) {
      const currentPlayer = sortedCurrentHitters[i];
      const currentSalary = (currentPlayer.player as any).salary || 0;
      const availableBudget = budgetRemaining + currentSalary;
      
      // Find better hitter within budget
      for (const betterPlayer of sortedHitters) {
        if (selectedHitters.includes(betterPlayer)) continue;
        if (betterPlayer.score <= currentPlayer.score) continue;
        
        const newSalary = (betterPlayer.player as any).salary || 0;
        if (newSalary <= availableBudget) {
          // Replace the player
          const index = selectedHitters.indexOf(currentPlayer);
          selectedHitters[index] = betterPlayer;
          totalSpent = totalSpent - currentSalary + newSalary;
          break;
        }
      }
    }
    
    // Try to upgrade pitchers
    for (let i = 0; i < sortedCurrentPitchers.length; i++) {
      const currentPlayer = sortedCurrentPitchers[i];
      const currentSalary = (currentPlayer.player as any).salary || 0;
      const availableBudget = (salaryCap - totalSpent) + currentSalary;
      
      // Find better pitcher within budget
      for (const betterPlayer of sortedPitchers) {
        if (selectedPitchers.includes(betterPlayer)) continue;
        if (betterPlayer.score <= currentPlayer.score) continue;
        
        const newSalary = (betterPlayer.player as any).salary || 0;
        if (newSalary <= availableBudget) {
          // Replace the player
          const index = selectedPitchers.indexOf(currentPlayer);
          selectedPitchers[index] = betterPlayer;
          totalSpent = totalSpent - currentSalary + newSalary;
          break;
        }
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
