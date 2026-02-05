import type { Hitter } from '../types';

export interface StrategyRecommendations {
  // Tendencies
  baseRunning: string;
  baseStealing: string;
  closerUsage: string;
  reliefUsage: string;
  bunting: string;
  hitAndRun: string;
  intentionalWalk: string;
  infieldIn: string;
  
  // Offensive subs
  pinchHitterVsLHP: string;
  pinchHitterVsRHP: string;
  pinchRunner: string;
  
  // Defensive subs
  defensiveReplacement1Player: string;
  defensiveReplacement1Position: string;
  defensiveReplacement2Player: string;
  defensiveReplacement2Position: string;
  defensiveReplacement3Player: string;
  defensiveReplacement3Position: string;
  defensiveReplacement4Player: string;
  defensiveReplacement4Position: string;
  
  // Explanation
  explanation: string;
}

interface TeamAnalysis {
  speedCount: { elite: number; good: number; average: number };
  contactCount: { elite: number; good: number; average: number };
  powerCount: { elite: number; good: number; average: number };
  defenseCount: { elite: number; good: number; average: number };
  balanceTypes: { leftHanded: number; rightHanded: number; switch: number };
  bestPinchHitterVsLHP: Hitter | null;
  bestPinchHitterVsRHP: Hitter | null;
  fastestRunner: Hitter | null;
  bestDefensiveReplacements: Array<{ player: Hitter; position: string }>;
}

function getStealRatingValue(stealRating?: string): number {
  if (!stealRating) return 0;
  const stlMap: Record<string, number> = { 'AAA': 7, 'AA': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
  return stlMap[stealRating.toUpperCase()] || 0;
}

function getRunRatingValue(runRating?: string): number {
  if (!runRating) return 0;
  const match = runRating.match(/(\d+)-/);
  return match ? parseInt(match[1]) : 0;
}

function getBalanceType(balance?: string): 'L' | 'R' | 'S' {
  if (!balance || balance === 'E') return 'S';
  if (balance.includes('L')) return 'L';
  if (balance.includes('R')) return 'R';
  return 'S';
}

function getBalanceValue(balance?: string): number {
  if (!balance || balance === 'E') return 0;
  const match = balance.match(/(\d+)([RL])/);
  return match ? parseInt(match[1]) : 0;
}

function getPrimaryPosition(hitter: Hitter): string {
  if (!hitter.defensivePositions || hitter.defensivePositions.length === 0) {
    return hitter.positions?.split(',')[0]?.trim() || 'DH';
  }
  return hitter.defensivePositions[0].position.toUpperCase();
}

function analyzeTeam(hitters: Hitter[]): TeamAnalysis {
  const analysis: TeamAnalysis = {
    speedCount: { elite: 0, good: 0, average: 0 },
    contactCount: { elite: 0, good: 0, average: 0 },
    powerCount: { elite: 0, good: 0, average: 0 },
    defenseCount: { elite: 0, good: 0, average: 0 },
    balanceTypes: { leftHanded: 0, rightHanded: 0, switch: 0 },
    bestPinchHitterVsLHP: null,
    bestPinchHitterVsRHP: null,
    fastestRunner: null,
    bestDefensiveReplacements: [],
  };

  // Analyze each hitter
  hitters.forEach(h => {
    // Speed analysis (STL rating is primary indicator)
    const stealValue = getStealRatingValue(h.stealRating);
    if (stealValue >= 6) analysis.speedCount.elite++;
    else if (stealValue >= 4) analysis.speedCount.good++;
    else analysis.speedCount.average++;

    // Contact analysis (BA)
    if (h.ba) {
      if (h.ba >= 0.320) analysis.contactCount.elite++;
      else if (h.ba >= 0.280) analysis.contactCount.good++;
      else analysis.contactCount.average++;
    }

    // Power analysis (HR per game)
    const hrPerGame = h.games > 0 ? h.homeRuns / h.games : 0;
    if (hrPerGame >= 0.15) analysis.powerCount.elite++;
    else if (hrPerGame >= 0.08) analysis.powerCount.good++;
    else analysis.powerCount.average++;

    // Defense analysis (range)
    if (h.fieldingRange === 1) analysis.defenseCount.elite++;
    else if (h.fieldingRange === 2) analysis.defenseCount.good++;
    else analysis.defenseCount.average++;

    // Balance types
    const balanceType = getBalanceType(h.balance);
    if (balanceType === 'L') analysis.balanceTypes.leftHanded++;
    else if (balanceType === 'R') analysis.balanceTypes.rightHanded++;
    else analysis.balanceTypes.switch++;
  });

  // Find best pinch hitter vs LHP (prefer right-handed batter with high balance vs LHP)
  const rightHandedBatters = hitters.filter(h => getBalanceType(h.balance) === 'R');
  if (rightHandedBatters.length > 0) {
    analysis.bestPinchHitterVsLHP = rightHandedBatters
      .sort((a, b) => {
        const aBalance = getBalanceValue(a.balance);
        const bBalanceValue = getBalanceValue(b.balance);
        if (aBalance !== bBalanceValue) return bBalanceValue - aBalance;
        return (b.ba || 0) - (a.ba || 0);
      })[0];
  } else {
    // Fallback: best overall hitter (highest BA)
    analysis.bestPinchHitterVsLHP = hitters
      .sort((a, b) => (b.ba || 0) - (a.ba || 0))[0] || null;
  }

  // Find best pinch hitter vs RHP (prefer left-handed batter with high balance vs RHP)
  const leftHandedBatters = hitters.filter(h => getBalanceType(h.balance) === 'L');
  if (leftHandedBatters.length > 0) {
    analysis.bestPinchHitterVsRHP = leftHandedBatters
      .sort((a, b) => {
        const aBalance = getBalanceValue(a.balance);
        const bBalance = getBalanceValue(b.balance);
        if (aBalance !== bBalance) return bBalance - aBalance;
        return (b.ba || 0) - (a.ba || 0);
      })[0];
  } else {
    // Fallback: second best overall hitter (to avoid duplicating PH vs LHP)
    const sortedByBA = hitters.sort((a, b) => (b.ba || 0) - (a.ba || 0));
    analysis.bestPinchHitterVsRHP = sortedByBA[1] || sortedByBA[0] || null;
  }

  // Find fastest runner (highest STL rating) - prefer someone different from pinch hitters
  const sortedBySpeed = hitters.sort((a, b) => {
    const aSpeed = getStealRatingValue(a.stealRating);
    const bSpeed = getStealRatingValue(b.stealRating);
    if (aSpeed !== bSpeed) return bSpeed - aSpeed;
    return getRunRatingValue(b.runRating) - getRunRatingValue(a.runRating);
  });
  
  // Try to find fastest runner who isn't already a pinch hitter
  const fastestNonPH = sortedBySpeed.find(h => 
    h.id !== analysis.bestPinchHitterVsLHP?.id && 
    h.id !== analysis.bestPinchHitterVsRHP?.id
  );
  analysis.fastestRunner = fastestNonPH || sortedBySpeed[0] || null;

  // Find best defensive replacements (elite defenders at key positions)
  const keyPositions = ['C', 'SS', 'CF', '2B', '3B'];
  keyPositions.forEach(pos => {
    const bestAtPosition = hitters
      .filter(h => h.defensivePositions?.some(dp => dp.position.toUpperCase() === pos))
      .sort((a, b) => {
        const aPos = a.defensivePositions?.find(dp => dp.position.toUpperCase() === pos);
        const bPos = b.defensivePositions?.find(dp => dp.position.toUpperCase() === pos);
        if (!aPos || !bPos) return 0;
        if (aPos.range !== bPos.range) return aPos.range - bPos.range;
        return aPos.error - bPos.error;
      })[0];
    
    if (bestAtPosition && bestAtPosition.defensivePositions) {
      const posData = bestAtPosition.defensivePositions.find(dp => dp.position.toUpperCase() === pos);
      if (posData && posData.range <= 2) {
        analysis.bestDefensiveReplacements.push({ player: bestAtPosition, position: pos });
      }
    }
  });

  return analysis;
}

export function generateStrategyRecommendations(hitters: Hitter[]): StrategyRecommendations {
  const analysis = analyzeTeam(hitters);
  
  const recommendations: StrategyRecommendations = {
    baseRunning: 'Normal',
    baseStealing: 'Normal',
    closerUsage: 'Regular',
    reliefUsage: 'Normal',
    bunting: 'Normal',
    hitAndRun: 'Normal',
    intentionalWalk: 'Normal',
    infieldIn: '3rd Inning',
    pinchHitterVsLHP: '',
    pinchHitterVsRHP: '',
    pinchRunner: '',
    defensiveReplacement1Player: '',
    defensiveReplacement1Position: '',
    defensiveReplacement2Player: '',
    defensiveReplacement2Position: '',
    defensiveReplacement3Player: '',
    defensiveReplacement3Position: '',
    defensiveReplacement4Player: '',
    defensiveReplacement4Position: '',
    explanation: '',
  };

  const explanationParts: string[] = [];

  // Base running strategy (based on speed)
  if (analysis.speedCount.elite >= 5) {
    recommendations.baseRunning = 'Very Aggressive';
    explanationParts.push(`Very Aggressive baserunning (${analysis.speedCount.elite} elite speed players)`);
  } else if (analysis.speedCount.elite >= 3) {
    recommendations.baseRunning = 'Aggressive';
    explanationParts.push(`Aggressive baserunning (${analysis.speedCount.elite} elite speed players)`);
  } else {
    recommendations.baseRunning = 'Normal';
    explanationParts.push('Normal baserunning (limited elite speed)');
  }

  // Base stealing strategy (based on STL ratings)
  if (analysis.speedCount.elite >= 5) {
    recommendations.baseStealing = 'Very Aggressive';
    explanationParts.push(`Very Aggressive stealing (${analysis.speedCount.elite} elite base stealers)`);
  } else if (analysis.speedCount.elite >= 3) {
    recommendations.baseStealing = 'Aggressive';
    explanationParts.push(`Aggressive stealing (${analysis.speedCount.elite} elite base stealers)`);
  } else {
    recommendations.baseStealing = 'Normal';
  }

  // Hit and run strategy (based on contact ability)
  if (analysis.contactCount.elite >= 4) {
    recommendations.hitAndRun = 'Aggressive';
    explanationParts.push(`Aggressive hit-and-run (${analysis.contactCount.elite} elite contact hitters)`);
  } else if (analysis.contactCount.elite >= 2) {
    recommendations.hitAndRun = 'Normal';
  } else {
    recommendations.hitAndRun = 'Conservative';
    explanationParts.push('Conservative hit-and-run (limited elite contact)');
  }

  // Bunting strategy (based on speed and contact)
  if (analysis.speedCount.elite >= 4 && analysis.contactCount.elite >= 3) {
    recommendations.bunting = 'Aggressive';
    explanationParts.push('Aggressive bunting (speed + contact combination)');
  } else {
    recommendations.bunting = 'Normal';
  }

  // Pinch hitters
  if (analysis.bestPinchHitterVsLHP) {
    const h = analysis.bestPinchHitterVsLHP;
    const hand = getBalanceType(h.balance);
    const pos = getPrimaryPosition(h);
    recommendations.pinchHitterVsLHP = `${h.name} (${hand}, ${pos})`;
    explanationParts.push(`PH vs LHP: ${h.name} (${h.balance} balance, ${h.ba?.toFixed(3)} BA)`);
  }

  if (analysis.bestPinchHitterVsRHP) {
    const h = analysis.bestPinchHitterVsRHP;
    const hand = getBalanceType(h.balance);
    const pos = getPrimaryPosition(h);
    recommendations.pinchHitterVsRHP = `${h.name} (${hand}, ${pos})`;
    explanationParts.push(`PH vs RHP: ${h.name} (${h.balance} balance, ${h.ba?.toFixed(3)} BA)`);
  }

  // Pinch runner
  if (analysis.fastestRunner) {
    const h = analysis.fastestRunner;
    const hand = getBalanceType(h.balance);
    const pos = getPrimaryPosition(h);
    recommendations.pinchRunner = `${h.name} (${hand}, ${pos})`;
    explanationParts.push(`PR: ${h.name} (${h.stealRating} steal rating)`);
  }

  // Defensive replacements
  analysis.bestDefensiveReplacements.slice(0, 4).forEach((replacement, index) => {
    const h = replacement.player;
    const hand = getBalanceType(h.balance);
    const pos = getPrimaryPosition(h);
    const playerStr = `${h.name} (${hand}, ${pos})`;
    const posStr = replacement.position;
    
    if (index === 0) {
      recommendations.defensiveReplacement1Player = playerStr;
      recommendations.defensiveReplacement1Position = posStr;
    } else if (index === 1) {
      recommendations.defensiveReplacement2Player = playerStr;
      recommendations.defensiveReplacement2Position = posStr;
    } else if (index === 2) {
      recommendations.defensiveReplacement3Player = playerStr;
      recommendations.defensiveReplacement3Position = posStr;
    } else if (index === 3) {
      recommendations.defensiveReplacement4Player = playerStr;
      recommendations.defensiveReplacement4Position = posStr;
    }
  });

  if (analysis.bestDefensiveReplacements.length > 0) {
    explanationParts.push(`Defensive subs: ${analysis.bestDefensiveReplacements.length} elite defenders for late-game situations`);
  }

  recommendations.explanation = explanationParts.join('. ') + '.';

  return recommendations;
}
