export interface PlayerCard {
  id: string;
  playerId: string; // Links to hitter or pitcher ID
  playerName: string;
  playerType: 'hitter' | 'pitcher';
  imageUrl: string;
  uploadedAt: Date;
  
  // Advanced hitting stats (from card)
  hitting?: {
    vsLefty?: {
      column1: string[];
      column2: string[];
      column3: string[];
    };
    vsRighty?: {
      column4: string[];
      column5: string[];
      column6: string[];
    };
    clutchHitting?: string; // $ symbol
    powerRating?: string; // N or W
    splitNumbers?: string; // e.g., "DO 1-14/SI 15-20"
  };
  
  // Advanced pitching stats (from card)
  pitching?: {
    vsLefty?: {
      column1: string[];
      column2: string[];
      column3: string[];
    };
    vsRighty?: {
      column4: string[];
      column5: string[];
      column6: string[];
    };
    wildPitch?: number;
    balk?: number;
    hold?: number;
    endurance?: string; // S6, R2, C4, etc.
    pitchingRating?: number; // 1-8 (1 best, 8 worst)
  };
  
  // Defensive ratings (detailed)
  defense?: {
    positions: {
      [position: string]: {
        range: number; // 1-5
        error: number;
        arm?: number; // For OF/C
        throwing?: string; // T-rating for catchers
        passedBall?: number; // For catchers
      };
    };
  };
  
  // Running/Speed
  running?: {
    stealRating: string; // AAA, AA, A, B, C, D, E
    stealDetails?: string; // e.g., "*(2-6,12/15-20)(17-19,3-20)"
    runRating: string; // 1-13 to 1-17
    bunting?: string; // A, B, C, D
    hitAndRun?: string; // A, B, C, D
  };
  
  // Injury
  injury?: {
    rating: string; // 1-13 to 1-17
    durability: string; // AA, A, B, C, D, E
  };
  
  // Ballpark effects
  ballpark?: string; // (8/8/8/8) format
  
  // Notes
  notes?: string;
}

export interface PlayerCardUpload {
  file: File;
  playerName: string;
  playerType: 'hitter' | 'pitcher';
}
