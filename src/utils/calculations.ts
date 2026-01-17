import type {
  Hitter,
  HitterWithStats,
  Pitcher,
  PitcherWithStats,
  HitterScoringWeights,
  PitcherScoringWeights,
} from '../types';

export function calculateHitterStats(
  hitter: Hitter,
  weights: HitterScoringWeights
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
  };
}

export function calculatePitcherStats(
  pitcher: Pitcher,
  weights: PitcherScoringWeights
): PitcherWithStats {
  const fantasyPoints =
    pitcher.strikeouts * weights.strikeout +
    pitcher.walks * weights.walkAllowed +
    pitcher.hitsAllowed * weights.hitAllowed +
    pitcher.homeRunsAllowed * weights.homeRunAllowed +
    pitcher.earnedRuns * weights.earnedRun;

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
