/**
 * Card Analysis Engine
 * 
 * Parses the 6 dice columns from Strat-O-Matic cards and computes
 * analytical scores that reveal the TRUE card quality beyond basic stats.
 * 
 * Each column has ~11-15 dice outcomes (rolls 2-12, some with sub-ranges).
 * The outcomes determine what happens when that column is "hit" during the game sim.
 * 
 * Hitter columns: 1-3 vs Lefty pitchers, 4-6 vs Righty pitchers
 * Pitcher columns: 4-6 vs Lefty batters, 4-6 vs Righty batters
 */

// Outcome values used by classifyOutcome() below

/**
 * Classify a single outcome string from a dice column cell
 */
function classifyOutcome(outcome: string): {
  type: string;
  value: number;
  isClutch: boolean;
  isSuperClutch: boolean;
  hasRange: boolean;
  rangeSize: number; // How many numbers in the sub-range (e.g., 1-14 = 14 out of 20)
} {
  const trimmed = outcome.trim();
  const isClutch = trimmed.startsWith('#');
  const isSuperClutch = trimmed.startsWith('$');
  const clean = trimmed.replace(/^[#$>]/, '').trim();
  
  // Check for sub-ranges like "1-14" which means this outcome only happens on those rolls
  let rangeSize = 20; // Default: full range (always happens)
  const rangeMatch = clean.match(/(\d+)-(\d+)$/);
  if (rangeMatch) {
    rangeSize = parseInt(rangeMatch[2]) - parseInt(rangeMatch[1]) + 1;
  }
  
  // Determine outcome type and value
  let type = 'out';
  let value = -0.3;
  
  if (/HOMERUN|^HR$/i.test(clean)) { type = 'homerun'; value = 4.0; }
  else if (/TRIPLE|^TR$/i.test(clean)) { type = 'triple'; value = 3.0; }
  else if (/DOUBLE|^DO$/i.test(clean)) { type = 'double'; value = 2.0; }
  else if (/SINGLE|^SI$/i.test(clean)) { type = 'single'; value = 1.0; }
  else if (/WALK|^HBP/i.test(clean)) { type = 'walk'; value = 0.8; }
  else if (/strikeout/i.test(clean)) { type = 'strikeout'; value = -0.5; }
  else if (/^gb\(/i.test(clean)) { type = 'groundBall'; value = -0.3; }
  else if (/^(fly|FB)\(/i.test(clean)) { type = 'flyBall'; value = -0.3; }
  else if (/lineout|^lo|popout|CATCH/i.test(clean)) { type = 'lineout'; value = -0.3; }
  
  // Adjust value by range (if it's a split outcome like "HR 1-14 / fly 15-20")
  const hasRange = rangeSize < 20;
  
  return { type, value, isClutch, isSuperClutch, hasRange, rangeSize };
}

/**
 * Parse a column's raw cell data into structured outcomes
 * Each cell from the table looks like: "diceNum|OUTCOME|rangeStart||secondOutcome|rangeEnd"
 * or simpler: "diceNum|OUTCOME"
 */
function parseColumnEntries(entries: string[]): Array<{
  diceRoll: string;
  outcomes: Array<ReturnType<typeof classifyOutcome>>;
}> {
  const results: Array<{ diceRoll: string; outcomes: Array<ReturnType<typeof classifyOutcome>> }> = [];
  
  for (const entry of entries) {
    const parts = entry.split('|').map(p => p.trim()).filter(p => p);
    if (parts.length === 0) continue;
    
    const diceRoll = parts[0]; // e.g., "#2-", "3-", "$12-"
    const outcomes: Array<ReturnType<typeof classifyOutcome>> = [];
    
    // Process remaining parts as outcomes
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!part || /^\d+-\d+$/.test(part) || part === '+ injury' || part === '') continue;
      
      const classified = classifyOutcome(part);
      outcomes.push(classified);
    }
    
    if (outcomes.length > 0) {
      results.push({ diceRoll, outcomes });
    }
  }
  
  return results;
}

/**
 * Compute card quality scores for a hitter's 6 columns
 */
export function analyzeHitterCard(columns: string[][]): {
  cardScore: number;
  onBaseCard: number;
  sluggingCard: number;
  clutchHits: number;
  clutchPlus: number;
  homeRunResults: number;
  walkResults: number;
  strikeoutResults: number;
  hitResults: number;
  outResults: number;
  vsLScore: number;
  vsRScore: number;
} {
  let totalValue = 0;
  let totalOutcomes = 0;
  let clutchHits = 0;
  let clutchPlus = 0;
  let homeRunResults = 0;
  let walkResults = 0;
  let strikeoutResults = 0;
  let hitResults = 0;
  let outResults = 0;
  let vsLValue = 0;
  let vsLCount = 0;
  let vsRValue = 0;
  let vsRCount = 0;
  
  // Bases values for slugging calculation
  let totalBases = 0;
  let onBaseEvents = 0;
  
  for (let colIdx = 0; colIdx < Math.min(6, columns.length); colIdx++) {
    const isVsLeft = colIdx < 3;
    const parsed = parseColumnEntries(columns[colIdx]);
    
    for (const entry of parsed) {
      for (const outcome of entry.outcomes) {
        // Weight by range size (if split outcome, only count proportional share)
        const weight = outcome.rangeSize / 20;
        
        totalValue += outcome.value * weight;
        totalOutcomes++;
        
        if (isVsLeft) { vsLValue += outcome.value * weight; vsLCount++; }
        else { vsRValue += outcome.value * weight; vsRCount++; }
        
        if (outcome.isClutch) clutchHits++;
        if (outcome.isSuperClutch) clutchPlus++;
        
        switch (outcome.type) {
          case 'homerun':
            homeRunResults++;
            hitResults++;
            totalBases += 4 * weight;
            onBaseEvents += weight;
            break;
          case 'triple':
            hitResults++;
            totalBases += 3 * weight;
            onBaseEvents += weight;
            break;
          case 'double':
            hitResults++;
            totalBases += 2 * weight;
            onBaseEvents += weight;
            break;
          case 'single':
            hitResults++;
            totalBases += 1 * weight;
            onBaseEvents += weight;
            break;
          case 'walk':
            walkResults++;
            onBaseEvents += weight;
            break;
          case 'strikeout':
            strikeoutResults++;
            outResults++;
            break;
          default:
            outResults++;
        }
      }
    }
  }
  
  // Normalize scores
  const cardScore = totalOutcomes > 0 ? Math.round((totalValue / totalOutcomes) * 100) : 0;
  const onBaseCard = totalOutcomes > 0 ? Math.round((onBaseEvents / totalOutcomes) * 1000) / 1000 : 0;
  const sluggingCard = totalOutcomes > 0 ? Math.round((totalBases / totalOutcomes) * 1000) / 1000 : 0;
  const vsLScore = vsLCount > 0 ? Math.round((vsLValue / vsLCount) * 100) : 0;
  const vsRScore = vsRCount > 0 ? Math.round((vsRValue / vsRCount) * 100) : 0;
  
  return {
    cardScore,
    onBaseCard,
    sluggingCard,
    clutchHits,
    clutchPlus,
    homeRunResults,
    walkResults,
    strikeoutResults,
    hitResults,
    outResults,
    vsLScore,
    vsRScore,
  };
}

/**
 * Compute card quality scores for a pitcher's 6 columns
 * For pitchers, MORE outs = better, MORE hits = worse (inverted from hitters)
 */
export function analyzePitcherCard(columns: string[][]): {
  cardScore: number;
  gbRate: number;
  kRate: number;
  hitResults: number;
  outResults: number;
  homeRunResults: number;
  walkResults: number;
  strikeoutResults: number;
  vsLScore: number;
  vsRScore: number;
} {
  let totalOutcomes = 0;
  let hitResults = 0;
  let outResults = 0;
  let homeRunResults = 0;
  let walkResults = 0;
  let strikeoutResults = 0;
  let groundBalls = 0;
  let vsLValue = 0;
  let vsLCount = 0;
  let vsRValue = 0;
  let vsRCount = 0;
  
  for (let colIdx = 0; colIdx < Math.min(6, columns.length); colIdx++) {
    const isVsLeft = colIdx < 3;
    const parsed = parseColumnEntries(columns[colIdx]);
    
    for (const entry of parsed) {
      for (const outcome of entry.outcomes) {
        const weight = outcome.rangeSize / 20;
        totalOutcomes++;
        
        // For pitchers, invert the value: outs are GOOD, hits are BAD
        const pitcherValue = -outcome.value;
        if (isVsLeft) { vsLValue += pitcherValue * weight; vsLCount++; }
        else { vsRValue += pitcherValue * weight; vsRCount++; }
        
        switch (outcome.type) {
          case 'homerun': homeRunResults++; hitResults++; break;
          case 'triple': case 'double': case 'single': hitResults++; break;
          case 'walk': walkResults++; break;
          case 'strikeout': strikeoutResults++; outResults++; break;
          case 'groundBall': groundBalls++; outResults++; break;
          default: outResults++;
        }
      }
    }
  }
  
  const cardScore = totalOutcomes > 0 ? Math.round(((outResults - hitResults) / totalOutcomes) * 100) : 0;
  const gbRate = outResults > 0 ? Math.round((groundBalls / outResults) * 1000) / 1000 : 0;
  const kRate = totalOutcomes > 0 ? Math.round((strikeoutResults / totalOutcomes) * 1000) / 1000 : 0;
  const vsLScore = vsLCount > 0 ? Math.round((vsLValue / vsLCount) * 100) : 0;
  const vsRScore = vsRCount > 0 ? Math.round((vsRValue / vsRCount) * 100) : 0;
  
  return {
    cardScore,
    gbRate,
    kRate,
    hitResults,
    outResults,
    homeRunResults,
    walkResults,
    strikeoutResults,
    vsLScore,
    vsRScore,
  };
}

/**
 * Auto-assign a card grade (A-F) based on card score
 * This replaces the manual grading with a data-driven grade
 */
export function computeCardGrade(cardScore: number, type: 'hitter' | 'pitcher'): string {
  if (type === 'hitter') {
    // Hitter card scores: higher = better card
    if (cardScore >= 80) return 'A+';
    if (cardScore >= 60) return 'A';
    if (cardScore >= 40) return 'B+';
    if (cardScore >= 25) return 'B';
    if (cardScore >= 10) return 'C+';
    if (cardScore >= 0) return 'C';
    if (cardScore >= -15) return 'D';
    return 'F';
  } else {
    // Pitcher card scores: higher = more outs generated vs hits allowed
    if (cardScore >= 50) return 'A+';
    if (cardScore >= 35) return 'A';
    if (cardScore >= 25) return 'B+';
    if (cardScore >= 15) return 'B';
    if (cardScore >= 5) return 'C+';
    if (cardScore >= 0) return 'C';
    if (cardScore >= -10) return 'D';
    return 'F';
  }
}
