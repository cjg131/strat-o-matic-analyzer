export interface Hitter {
  id: string;
  name: string;
  season: string;
  team?: string;
  positions: string;
  salary: number;
  balance: string;
  fieldingRange: number;
  fieldingError: number;
  ab: number;
  h: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  walks: number;
  hitByPitch: number;
  stolenBases: number;
  caughtStealing: number;
  plateAppearances: number;
  games: number;
}

export interface HitterWithStats extends Hitter {
  singles: number;
  fantasyPoints: number;
  pointsPer600PA: number;
  pointsPerGame: number;
  pointsPerDollar: number;
}

export interface Pitcher {
  id: string;
  name: string;
  season: string;
  team?: string;
  salary: number;
  inningsPitched: number;
  strikeouts: number;
  walks: number;
  hitsAllowed: number;
  homeRunsAllowed: number;
  earnedRuns: number;
  games: number;
  gamesStarted: number;
  throwingArm: string;
  endurance: string;
  fieldingRange: number;
  fieldingError: number;
  hitting: string;
  balk: number;
  wildPitch: number;
  hold: number;
  bunting: string;
}

export interface PitcherWithStats extends Pitcher {
  fantasyPoints: number;
  pointsPerIP: number;
  pointsPerStart: number;
  pointsPerDollar: number;
  singles: number;
}

export interface Ballpark {
  id: string;
  name: string;
  team?: string;
  singlesLeft: number;
  singlesRight: number;
  homeRunsLeft: number;
  homeRunsRight: number;
}

export interface HitterScoringWeights {
  single: number;
  double: number;
  triple: number;
  homeRun: number;
  walk: number;
  hitByPitch: number;
  stolenBase: number;
  caughtStealing: number;
  outPenalty: number;
  balanceVsRHP: number;
  balanceVsLHP: number;
  fieldingRangeBonus: number;
  fieldingErrorPenalty: number;
}

export interface PitcherScoringWeights {
  perInningPitched: number;
  strikeout: number;
  walkAllowed: number;
  hitAllowed: number;
  homeRunAllowed: number;
  earnedRun: number;
}

export interface ScoringWeights {
  hitter: HitterScoringWeights;
  pitcher: PitcherScoringWeights;
}

export const DEFAULT_HITTER_WEIGHTS: HitterScoringWeights = {
  single: 2,
  double: 3,
  triple: 5,
  homeRun: 6,
  walk: 1,
  hitByPitch: 1,
  stolenBase: 2,
  caughtStealing: -1,
  outPenalty: -0.3,
  balanceVsRHP: 0,
  balanceVsLHP: 0,
  fieldingRangeBonus: 0,
  fieldingErrorPenalty: 0,
};

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  hitter: {
    single: 2,
    double: 3,
    triple: 5,
    homeRun: 6,
    walk: 1,
    hitByPitch: 1,
    stolenBase: 2,
    caughtStealing: -1,
    outPenalty: -0.3,
    balanceVsRHP: 0,
    balanceVsLHP: 0,
    fieldingRangeBonus: 0,
    fieldingErrorPenalty: 0,
  },
  pitcher: {
    perInningPitched: 3,
    strikeout: 1,
    walkAllowed: -1,
    hitAllowed: -1,
    homeRunAllowed: -3,
    earnedRun: -2,
  },
};
