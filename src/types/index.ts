export interface DefensivePosition {
  position: string; // 1b, 2b, 3b, ss, c, lf, cf, rf
  range: number; // 1 (best) to 5 (worst)
  arm?: number; // OF/C only: -6 (best) to +3 (worst)
  error: number; // Lower is better
  throwingRating?: string; // Catcher only: e.g., "T-7(pb-5)"
}

export interface Hitter {
  id: string;
  name: string;
  season: string;
  team?: string;
  roster?: string;
  positions: string; // Comma-separated list for display
  defensivePositions: DefensivePosition[]; // Detailed defensive stats per position
  salary: number;
  balance: string;
  fieldingRange: number; // Deprecated - kept for backward compatibility
  fieldingError: number; // Deprecated - kept for backward compatibility
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
  ba?: number; // Batting Average
  obp?: number; // On-Base Percentage
  slg?: number; // Slugging Percentage
  notes?: string; // User notes about the player
  cardGrade?: string; // Manual card quality grade: A, B, C, D, F

  // === Card Data (scraped from Strat-O-Matic 365) ===
  cardData?: {
    powerVsL?: string; // N (normal) or W (wide) - affects ballpark HR columns
    powerVsR?: string;
    pctVsL?: number; // Percentage of plate appearances vs lefty pitchers
    pctVsR?: number;
    bunting?: string; // A, B, C, D
    hitAndRun?: string; // A, B, C, D
    stealDetails?: string; // e.g., "*7/- (17-6)"
    defenseRaw?: string; // Raw defense string e.g., "rf-1(-4)e6"
    columns?: string[][]; // 6 arrays: vsL col1-3, vsR col1-3 (dice outcomes)
    cardScore?: number; // Computed card quality score
    onBaseCard?: number; // Card-based OBP (from dice outcomes)
    sluggingCard?: number; // Card-based SLG (from dice outcomes)
    clutchHits?: number; // Count of # (clutch) results
    clutchPlus?: number; // Count of $ (super clutch) results
    homeRunResults?: number; // Total HR outcomes across all columns
    walkResults?: number; // Total WALK outcomes
    strikeoutResults?: number; // Total strikeout outcomes
    hitResults?: number; // Total hit outcomes (SI, DO, TR, HR)
    outResults?: number; // Total out outcomes (fly, gb, strikeout, etc.)
  };
}

export interface HitterWithStats extends Hitter {
  singles: number;
  fantasyPoints: number;
  pointsPer600PA: number;
  pointsPerGame: number;
  pointsPerDollar: number;
  ballparkAdjustedPoints?: number;
}

export interface Pitcher {
  id: string;
  name: string;
  season: string;
  team?: string;
  roster?: string;
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
  notes?: string; // User notes about the player
  cardGrade?: string; // Manual card quality grade: A, B, C, D, F

  // === Card Data (scraped from Strat-O-Matic 365) ===
  cardData?: {
    pitcherRating?: number; // 1-8 (1 best, 8 worst) - affects pitcher's dice column
    pctVsL?: number; // Percentage vs lefty batters
    pctVsR?: number;
    columns?: string[][]; // 6 arrays: vsL col4-6, vsR col4-6 (dice outcomes)
    cardScore?: number; // Computed card quality score
    gbRate?: number; // Ground ball rate from card outcomes
    kRate?: number; // Strikeout rate from card outcomes
    hitResults?: number; // Total hit outcomes allowed
    outResults?: number; // Total out outcomes generated
    homeRunResults?: number; // HR outcomes allowed
    walkResults?: number; // Walk outcomes
    strikeoutResults?: number; // K outcomes
  };
}

export interface PitcherWithStats extends Pitcher {
  fantasyPoints: number;
  pointsPerIP: number;
  pointsPerStart: number;
  pointsPerDollar: number;
  singles: number;
  enduranceScore: number;
  ballparkAdjustedPoints?: number;
}

export interface Ballpark {
  id: string;
  name: string;
  team?: string;
  singlesLeft: number;
  singlesRight: number;
  homeRunsLeft: number;
  homeRunsRight: number;
  offenseRating: number;
  defenseRating: number;
  speedDefenseRating: number;
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
  stlRating: number;
  runRating: number;
  outPenalty: number;
  balanceVsRHP: number;
  balanceVsLHP: number;
  fieldingRangeBonus: number;
  fieldingErrorPenalty: number;
  // Card-based weights
  cardScoreWeight: number; // Weight for overall card quality score
  clutchWeight: number; // Weight for clutch hitting (#/$) results
  powerRatingWeight: number; // Weight for W (wide) power rating
  buntingWeight: number; // Weight for bunting rating (A=4, B=3, C=2, D=1)
  hitAndRunWeight: number; // Weight for hit & run rating
}

export interface PitcherScoringWeights {
  strikeout: number;
  walkAllowed: number;
  hitAllowed: number;
  homeRunAllowed: number;
  earnedRun: number;
  enduranceWeight: number;
  // Card-based weights
  cardScoreWeight: number; // Weight for overall card quality score
  pitcherRatingWeight: number; // Weight for pitcher rating (1=best, 8=worst)
  gbRateWeight: number; // Weight for ground ball rate
  kRateWeight: number; // Weight for strikeout rate on card
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
  stlRating: 3,
  runRating: 1.5,
  outPenalty: -0.3,
  balanceVsRHP: 0,
  balanceVsLHP: 0,
  fieldingRangeBonus: 0,
  fieldingErrorPenalty: 0,
  cardScoreWeight: 0.5,
  clutchWeight: 1,
  powerRatingWeight: 2,
  buntingWeight: 0.5,
  hitAndRunWeight: 0.5,
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
    stlRating: 3,
    runRating: 1.5,
    outPenalty: -0.3,
    balanceVsRHP: 0,
    balanceVsLHP: 0,
    fieldingRangeBonus: 0,
    fieldingErrorPenalty: 0,
    cardScoreWeight: 0.5,
    clutchWeight: 1,
    powerRatingWeight: 2,
    buntingWeight: 0.5,
    hitAndRunWeight: 0.5,
  },
  pitcher: {
    strikeout: 1,
    walkAllowed: -1,
    hitAllowed: -1,
    homeRunAllowed: -3,
    earnedRun: -2,
    enduranceWeight: 0.5,
    cardScoreWeight: 0.5,
    pitcherRatingWeight: 3,
    gbRateWeight: 1,
    kRateWeight: 2,
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
