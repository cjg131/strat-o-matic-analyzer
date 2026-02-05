import type { Hitter } from '../types';

export interface HitterPreference {
  id: string;
  name: string;
  hand: string;
  position: string;
  balance: string;
  stealRating: string;
  avoidLHP: boolean;
  avoidRHP: boolean;
  moreSacBunt: boolean;
  dontSacBunt: boolean;
  moreHitAndRun: boolean;
  dontHitAndRun: boolean;
  moreSteal: boolean;
  dontSteal: boolean;
  dontPHvsLHP: boolean;
  dontPHvsRHP: boolean;
  avoidPHInBlowouts: boolean;
  rememberFor4DefSub: boolean;
  pinchRunForDont: boolean;
}

function getHandFromBalance(balance?: string): string {
  if (!balance) return 'S';
  if (balance.includes('L')) return 'L';
  if (balance.includes('R')) return 'R';
  return 'S'; // Switch hitter or even balance
}

export function generateHitterPreferences(hitters: Hitter[]): HitterPreference[] {
  return hitters.map(hitter => {
    const stealRating = hitter.stealRating || 'E';
    const slg = hitter.slg || 0;
    const ba = hitter.ba || 0;
    const isPowerHitter = slg >= 0.450; // Power hitter if SLG >= .450
    const hand = getHandFromBalance(hitter.balance);
    
    // Get best defensive position rating (lower is better)
    let bestDefenseRating = 999;
    if (hitter.defensivePositions && Array.isArray(hitter.defensivePositions)) {
      for (const defPos of hitter.defensivePositions) {
        const rating = (defPos.range * 2) + defPos.error;
        if (rating < bestDefenseRating) {
          bestDefenseRating = rating;
        }
      }
    }
    const isEliteDefender = bestDefenseRating <= 4; // Range 1 + Error 2 or better
    
    // Determine if player is a regular starter (high games played)
    const isRegularStarter = (hitter.games || 0) >= 100;
    
    return {
      id: hitter.id,
      name: hitter.name,
      hand,
      position: hitter.positions?.split(',')[0]?.trim() || 'DH',
      balance: hitter.balance || 'E',
      stealRating,
      
      // Avoid settings - typically not set by default
      avoidLHP: false,
      avoidRHP: false,
      
      // Sac bunt preferences
      moreSacBunt: false, // Let manager decide based on situation
      dontSacBunt: isPowerHitter, // Power hitters should not bunt
      
      // Hit and run preferences
      moreHitAndRun: ba >= 0.280, // Good contact hitters (BA >= .280)
      dontHitAndRun: ba < 0.220, // Poor contact hitters
      
      // Stealing preferences
      moreSteal: stealRating === 'AA' || stealRating === 'A', // Elite base stealers
      dontSteal: stealRating === 'D' || stealRating === 'E', // Poor base stealers
      
      // Pinch hitting protection
      dontPHvsLHP: isPowerHitter && hand === 'R', // Protect RH power hitters vs LHP
      dontPHvsRHP: isPowerHitter && hand === 'L', // Protect LH power hitters vs RHP
      
      // Blowout protection
      avoidPHInBlowouts: isPowerHitter || isRegularStarter, // Protect starters and stars
      
      // Defensive substitution
      rememberFor4DefSub: isEliteDefender, // Elite defenders for late-inning defense
      
      // Pinch running
      pinchRunForDont: stealRating === 'D' || stealRating === 'E', // Don't PR for slow runners
    };
  });
}
