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
  stealRating?: string; // STL column: AA, A, B, C, D, E (AA best, E worst)
  runRating?: string; // RUN column: 1-17 (best) to 1-8 (worst)
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
    strikeout: 1,
    walkAllowed: -1,
    hitAllowed: -1,
    homeRunAllowed: -3,
    earnedRun: -2,
  },
};

export interface RosterRequirements {
  minPitchers: number;
  maxPitchers: number;
  minCanStart: number; // Pitchers who CAN start (have S endurance)
  minCanRelieve: number; // Pitchers who CAN relieve (have R or C endurance)
  minPureRelievers: number; // Pitchers who can relieve but CANNOT start
  minHitters: number;
  maxHitters: number;
  minCatchers: number;
  requireAllPositions: boolean; // Must have at least 1 player at each of 9 positions
  salaryCap: number;
}

export const DEFAULT_ROSTER_REQUIREMENTS: RosterRequirements = {
  minPitchers: 10,
  maxPitchers: 12,
  minCanStart: 5, // At least 5 who can start
  minCanRelieve: 4, // At least 4 who can relieve
  minPureRelievers: 4, // At least 4 pure relievers (can relieve but cannot start)
  minHitters: 13,
  maxHitters: 17,
  minCatchers: 2, // At least 2 catchers (1 at C position + 1 extra)
  requireAllPositions: true, // Must have C, 1B, 2B, 3B, SS, LF, CF, RF, DH
  salaryCap: 80000000,
};

export interface TeamRoster {
  id: string;
  name: string;
  hitters: Hitter[];
  pitchers: Pitcher[];
  totalSalary: number;
  ballpark?: Ballpark;
  ballparkStrategy: 'balanced' | 'offense' | 'defense' | 'speedDefense';
}
