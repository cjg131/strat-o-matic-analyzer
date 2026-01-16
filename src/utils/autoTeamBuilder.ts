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
  const hitterBudget = (salaryCap * strategy.hitterBudgetPercent) / 100;
  const pitcherBudget = (salaryCap * strategy.pitcherBudgetPercent) / 100;

  // Score all players
  const scoredHitters = hitters.map((h) => ({
    player: h,
    score: scoreHitter(h, strategy),
    isPitcher: false,
  }));

  const scoredPitchers = pitchers.map((p) => ({
    player: p,
    score: scorePitcher(p, strategy),
    isPitcher: true,
  }));

  // Select best pitchers within budget
  const selectedPitchers = selectBestPitchers(
    scoredPitchers,
    strategy,
    pitcherBudget
  );

  // Select best hitters within budget
  const selectedHitters = selectBestHitters(
    scoredHitters,
    strategy,
    hitterBudget
  );

  return {
    selectedHitters: selectedHitters.map((sh) => sh.player as Hitter),
    selectedPitchers: selectedPitchers.map((sp) => sp.player as Pitcher),
  };
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

function selectBestPitchers(
  scoredPitchers: ScoredPlayer[],
  strategy: AutoBuildStrategy,
  budget: number
): ScoredPlayer[] {
  const sorted = [...scoredPitchers].sort((a, b) => b.score - a.score);
  const selected: ScoredPlayer[] = [];
  let spent = 0;

  // Track requirements
  let canStartCount = 0;
  let canRelieveCount = 0;
  let pureRelieverCount = 0;

  // First pass: ensure minimum requirements with flexible budget
  for (const sp of sorted) {
    const pitcher = sp.player as PitcherWithStats;
    const endurance = pitcher.endurance?.toUpperCase() || '';
    const hasStarterRole = endurance.includes('S');
    const hasRelieverRole = endurance.includes('R') || endurance.includes('C');
    const isPureReliever = hasRelieverRole && !hasStarterRole;

    // Check if we need this pitcher for requirements
    const needsStarter = canStartCount < strategy.targetCanStart && hasStarterRole;
    const needsReliever = canRelieveCount < strategy.targetCanRelieve && hasRelieverRole;
    const needsPureReliever = pureRelieverCount < strategy.targetPureRelievers && isPureReliever;
    
    // If we need this pitcher type and haven't hit target, be more flexible with budget
    const isRequired = needsStarter || needsReliever || needsPureReliever;
    const canAfford = spent + pitcher.salary <= budget * 1.2; // Allow 20% overage for requirements
    
    if (!canAfford && !isRequired) continue;
    if (selected.length >= strategy.targetPitchers) break;

    if (isRequired || selected.length < strategy.targetPitchers) {
      selected.push(sp);
      spent += pitcher.salary;
      
      if (hasStarterRole) canStartCount++;
      if (hasRelieverRole) canRelieveCount++;
      if (isPureReliever) pureRelieverCount++;
    }
  }

  // Second pass: fill remaining slots if under target
  for (const sp of sorted) {
    if (selected.includes(sp)) continue;
    if (selected.length >= strategy.targetPitchers) break;
    
    const pitcher = sp.player as PitcherWithStats;
    if (spent + pitcher.salary > budget) continue;
    
    selected.push(sp);
    spent += pitcher.salary;
  }

  return selected;
}

function selectBestHitters(
  scoredHitters: ScoredPlayer[],
  strategy: AutoBuildStrategy,
  budget: number
): ScoredPlayer[] {
  const sorted = [...scoredHitters].sort((a, b) => b.score - a.score);
  const selected: ScoredPlayer[] = [];
  let spent = 0;

  const catchers: ScoredPlayer[] = [];

  // First, ensure we get 2 catchers
  for (const sh of sorted) {
    const hitter = sh.player as HitterWithStats;
    if (hitter.positions?.toUpperCase().includes('C') && catchers.length < 2) {
      if (spent + hitter.salary <= budget) {
        selected.push(sh);
        catchers.push(sh);
        spent += hitter.salary;
      }
    }
  }

  // Fill remaining slots with best available
  for (const sh of sorted) {
    if (selected.includes(sh)) continue;
    const hitter = sh.player as HitterWithStats;
    if (spent + hitter.salary > budget) continue;
    if (selected.length >= strategy.targetHitters) break;
    
    selected.push(sh);
    spent += hitter.salary;
  }

  return selected;
}
