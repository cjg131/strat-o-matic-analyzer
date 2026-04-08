import type {
  Hitter,
  HitterWithStats,
  Pitcher,
  PitcherWithStats,
  HitterScoringWeights,
  PitcherScoringWeights,
  Ballpark,
} from '../types';

// Endurance value mapping - higher = more valuable in the sim
// Starters: S9 (can pitch 9 innings) is far more valuable than S3
// Closers: C4 is elite, C1 is marginal
// Relievers: R3 can go multiple innings, R1 is a one-inning guy
const ENDURANCE_VALUES: Record<string, number> = {
  'S9': 100, 'S8': 90, 'S7': 80, 'S6': 70, 'S5': 60,
  'S4': 50, 'S3': 40, 'S2': 30, 'S1': 20,
  'S9+': 105, 'S8+': 95, 'S7+': 85, 'S6+': 75, 'S5+': 65,
  'S4+': 55, 'S3+': 45, 'S2+': 35, 'S1+': 25,
  'C4': 50, 'C3': 40, 'C2': 30, 'C1': 20,
  'C4+': 55, 'C3+': 45, 'C2+': 35, 'C1+': 25,
  'R3': 35, 'R2': 25, 'R1': 15,
  'R3+': 40, 'R2+': 30, 'R1+': 20,
};

/**
 * Calculate ballpark adjustment for a hitter
 * Compares park factors to neutral (8/8/8/8) and adjusts based on hitter profile
 */
export function calculateBallparkEffect(
  hitter: Hitter,
  ballpark: Ballpark,
  weights: HitterScoringWeights
): number {
  const NEUTRAL = 8;
  
  // How much this park boosts/suppresses singles and HRs
  // Weight by approximate L/R pitcher facing rates
  const lhpFacing = 0.30;
  const rhpFacing = 0.70;
  
  const singlesModifier = 
    (ballpark.singlesLeft - NEUTRAL) * lhpFacing + 
    (ballpark.singlesRight - NEUTRAL) * rhpFacing;
    
  const hrModifier = 
    (ballpark.homeRunsLeft - NEUTRAL) * lhpFacing + 
    (ballpark.homeRunsRight - NEUTRAL) * rhpFacing;
  
  // Scale by hitter's profile
  const ab = Math.max(hitter.ab, 1);
  const powerRatio = hitter.homeRuns / ab;
  const contactRatio = (hitter.h - hitter.homeRuns) / ab;
  
  // Park effect: power hitters benefit from HR-friendly parks
  // Contact hitters benefit from singles-friendly parks
  const hrAdjustment = hrModifier * powerRatio * weights.homeRun * 8;
  const singlesAdjustment = singlesModifier * contactRatio * weights.single * 8;
  
  return hrAdjustment + singlesAdjustment;
}

/**
 * Calculate ballpark adjustment for a pitcher (inverted from hitter)
 * Pitcher-friendly parks suppress offense, which helps pitcher value
 */
export function calculatePitcherBallparkEffect(
  pitcher: Pitcher,
  ballpark: Ballpark,
  weights: PitcherScoringWeights
): number {
  const NEUTRAL = 8;
  
  const lhpFacing = 0.30;
  const rhpFacing = 0.70;
  
  // For pitchers, LOWER park factors are BETTER (suppresses offense)
  const singlesModifier = 
    (NEUTRAL - ballpark.singlesLeft) * lhpFacing + 
    (NEUTRAL - ballpark.singlesRight) * rhpFacing;
    
  const hrModifier = 
    (NEUTRAL - ballpark.homeRunsLeft) * lhpFacing + 
    (NEUTRAL - ballpark.homeRunsRight) * rhpFacing;
  
  // Scale by pitcher's vulnerability
  const ip = Math.max(pitcher.inningsPitched, 1);
  const hrRate = pitcher.homeRunsAllowed / ip;
  const hitRate = pitcher.hitsAllowed / ip;
  
  const hrAdjustment = hrModifier * hrRate * Math.abs(weights.homeRunAllowed) * 5;
  const hitsAdjustment = singlesModifier * hitRate * Math.abs(weights.hitAllowed) * 5;
  
  return hrAdjustment + hitsAdjustment;
}

/**
 * Get the endurance score for a pitcher
 */
export function getEnduranceScore(endurance: string): number {
  if (!endurance) return 0;
  const key = endurance.toUpperCase().trim();
  return ENDURANCE_VALUES[key] || 0;
}

export function calculateHitterStats(
  hitter: Hitter,
  weights: HitterScoringWeights,
  ballpark?: Ballpark
): HitterWithStats {
  const singles = hitter.h - hitter.doubles - hitter.triples - hitter.homeRuns;
  const outs = hitter.ab - hitter.h;

  // Calculate balance bonus
  let balanceBonus = 0;
  const balance = hitter.balance || 'E';
  if (balance !== 'E') {
    const match = balance.match(/(\d+)([RL])/);
    if (match) {
      const level = parseInt(match[1]) || 0;
      const side = match[2];
      if (side === 'R') {
        balanceBonus = level * (weights.balanceVsRHP || 0);
      } else if (side === 'L') {
        balanceBonus = level * (weights.balanceVsLHP || 0);
      }
    }
  }
  
  // Ensure balanceBonus is a valid number
  if (isNaN(balanceBonus) || !isFinite(balanceBonus)) {
    balanceBonus = 0;
  }

  // Calculate defensive contribution
  // Range: 1 (best) to 5 (worst), so we invert it: (6 - range) gives higher bonus for better range
  // Error: negative is good, positive is bad
  let defensivePoints = 0;
  if (hitter.fieldingRange > 0) {
    const rangeBonus = (6 - hitter.fieldingRange) * (weights.fieldingRangeBonus || 0);
    const errorPenalty = hitter.fieldingError * (weights.fieldingErrorPenalty || 0);
    defensivePoints = rangeBonus + errorPenalty;
  }

  // Calculate speed rating bonus
  // STL rating: AAA=7, AA=6, A=5, B=4, C=3, D=2, E=1 (PRIMARY speed indicator)
  // RUN rating: Extract first number from format "1-17" (higher is better, 17 best, 8 worst) (PRIMARY speed indicator)
  let speedRatingBonus = 0;
  if (hitter.stealRating) {
    const stlMap: Record<string, number> = { 'AAA': 7, 'AA': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
    const stlRatingStr = String(hitter.stealRating).toUpperCase();
    const stlValue = stlMap[stlRatingStr] || 0;
    speedRatingBonus += stlValue * (weights.stlRating || 0); // STL rating uses dedicated weight
  }
  if (hitter.runRating) {
    const runRatingStr = String(hitter.runRating);
    const runMatch = runRatingStr.match(/(\d+)-/);
    if (runMatch) {
      const runValue = parseInt(runMatch[1]);
      // Normalize run rating: 17 is best (1-17), 8 is worst (1-8)
      // Higher first number = better speed
      speedRatingBonus += runValue * (weights.runRating || 0); // RUN rating uses dedicated weight
    }
  }

  const fantasyPoints =
    singles * weights.single +
    hitter.doubles * weights.double +
    hitter.triples * weights.triple +
    hitter.homeRuns * weights.homeRun +
    hitter.walks * weights.walk +
    hitter.hitByPitch * weights.hitByPitch +
    hitter.stolenBases * weights.stolenBase +
    hitter.caughtStealing * weights.caughtStealing +
    outs * weights.outPenalty +
    balanceBonus +
    defensivePoints +
    speedRatingBonus;

  // Calculate ballpark-adjusted points if a ballpark is provided
  let ballparkAdjustedPoints: number | undefined;
  if (ballpark) {
    const parkEffect = calculateBallparkEffect(hitter, ballpark, weights);
    ballparkAdjustedPoints = fantasyPoints + parkEffect;
  }

  const pointsPer600PA =
    hitter.plateAppearances > 0
      ? (fantasyPoints / hitter.plateAppearances) * 600
      : 0;

  const pointsPerGame = hitter.games > 0 ? fantasyPoints / hitter.games : 0;

  const pointsPerDollar = hitter.salary > 0 ? (fantasyPoints / (hitter.salary / 1000)) * 100 : 0;

  return {
    ...hitter,
    singles,
    fantasyPoints,
    pointsPer600PA,
    pointsPerGame,
    pointsPerDollar,
    ballparkAdjustedPoints,
  };
}

export function calculatePitcherStats(
  pitcher: Pitcher,
  weights: PitcherScoringWeights,
  ballpark?: Ballpark
): PitcherWithStats {
  // Base stats calculation
  const basePoints =
    pitcher.strikeouts * weights.strikeout +
    pitcher.walks * weights.walkAllowed +
    pitcher.hitsAllowed * weights.hitAllowed +
    pitcher.homeRunsAllowed * weights.homeRunAllowed +
    pitcher.earnedRuns * weights.earnedRun;

  // Endurance scoring - this is a major Strat-O-Matic factor
  // S9 pitcher who can go 9 innings per start is worth far more than S3
  const enduranceScore = getEnduranceScore(pitcher.endurance);
  const endurancePoints = enduranceScore * (weights.enduranceWeight || 0);

  const fantasyPoints = basePoints + endurancePoints;

  // Ballpark adjustment for pitchers
  let ballparkAdjustedPoints: number | undefined;
  if (ballpark) {
    const parkEffect = calculatePitcherBallparkEffect(pitcher, ballpark, weights);
    ballparkAdjustedPoints = fantasyPoints + parkEffect;
  }

  const pointsPerIP =
    pitcher.inningsPitched > 0 ? fantasyPoints / pitcher.inningsPitched : 0;

  const pointsPerStart =
    pitcher.gamesStarted > 0 ? fantasyPoints / pitcher.gamesStarted : 0;

  const pointsPerDollar =
    pitcher.salary > 0 ? (fantasyPoints / (pitcher.salary / 1000)) * 100 : 0;

  const singles = pitcher.hitsAllowed - pitcher.homeRunsAllowed;

  return {
    ...pitcher,
    fantasyPoints,
    pointsPerIP,
    pointsPerStart,
    pointsPerDollar,
    singles,
    enduranceScore,
    ballparkAdjustedPoints,
  };
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (decimals === 0) {
    return Math.round(value).toString();
  }
  return value.toFixed(decimals);
}

export function formatCurrency(value: number): string {
  const valueInThousands = value / 1000;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valueInThousands);
  
  // Pad to ensure consistent width (assuming max value is $999,999 = $999)
  const parts = formatted.split('$');
  const number = parts[1];
  return '$' + number.padStart(6, ' ');
}
