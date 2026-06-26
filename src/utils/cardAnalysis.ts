/**
 * Card Analysis Engine v2
 * 
 * Parses the 6 dice columns from Strat-O-Matic cards and computes
 * analytical scores that reveal the TRUE card quality beyond basic stats.
 * 
 * Data format from scraper: each column is an array of individual table cells:
 * ["#2-", "HR", "1-8", "fly(cf)B", "9-20", ">3-", "SINGLE(rf)", "4-", "WALK", ...]
 * 
 * Pattern: [diceRoll, outcome, (optional subRange), (optional outcome2), (optional subRange2), ...]
 * Dice roll markers: # = clutch, $ = super clutch, > = improved result indicator
 * 
 * Hitter columns: 0-2 vs Lefty pitchers, 3-5 vs Righty pitchers
 * Pitcher columns: 0-2 vs Lefty batters, 3-5 vs Righty batters
 */

interface ParsedOutcome {
  diceRoll: number;
  isClutch: boolean;       // # prefix
  isSuperClutch: boolean;  // $ prefix
  isImproved: boolean;     // > prefix
  type: string;            // homerun, triple, double, single, walk, strikeout, groundBall, flyBall, lineout
  rangeStart: number;      // Sub-range start (1 if full range)
  rangeEnd: number;        // Sub-range end (20 if full range)
  probability: number;     // rangeSize / 20 (fraction of this dice roll this outcome covers)
  rawText: string;
}

function classifyOutcomeType(text: string): string {
  const clean = text.toUpperCase().trim();
  if (/^HR$|HOMERUN|HOME\s*RUN/.test(clean)) return 'homerun';
  if (/^TR$|TRIPLE/.test(clean)) return 'triple';
  if (/^DO$|DOUBLE/.test(clean)) return 'double';
  if (/SINGLE/.test(clean)) return 'single';
  if (/WALK|^HBP|^HP/.test(clean)) return 'walk';
  if (/STRIKEOUT/.test(clean)) return 'strikeout';
  if (/^GB\(/.test(clean)) return 'groundBall';
  if (/^FLY\(|^FB\(|^FO\(/.test(clean)) return 'flyBall';
  if (/LINEOUT|^LO\(|POPOUT|^PO\(|CATCH|^FO/.test(clean)) return 'lineout';
  if (/^IF/.test(clean)) return 'groundBall'; // infield hit attempt or IF error
  return 'out'; // generic out
}

function getOutcomeValue(type: string): number {
  switch (type) {
    case 'homerun': return 4.0;
    case 'triple': return 3.0;
    case 'double': return 2.0;
    case 'single': return 1.0;
    case 'walk': return 0.8;
    case 'strikeout': return -0.5;
    case 'groundBall': return -0.25; // Slightly better than flyball (can advance runners, DP risk though)
    case 'flyBall': return -0.3;
    case 'lineout': return -0.3;
    default: return -0.3;
  }
}

/**
 * Parse a column's raw cell array into structured outcomes.
 * 
 * Input: ["#2-", "HR", "1-8", "fly(cf)B", "9-20", ">3-", "SINGLE(rf)", "4-", "WALK", ...]
 * 
 * Logic:
 * - Cell matching /^[#$>]?\d+-$/ is a dice roll marker (start of new entry)
 * - Cell matching /^\d+-\d+$/ is a sub-range (e.g., "1-8", "9-20")
 * - Everything else is an outcome text
 */
function parseColumn(cells: string[]): ParsedOutcome[] {
  const outcomes: ParsedOutcome[] = [];
  
  let currentDice = 0;
  let currentClutch = false;
  let currentSuperClutch = false;
  let currentImproved = false;
  let pendingOutcomes: { text: string; rangeStart: number; rangeEnd: number }[] = [];
  let lastOutcomeText = '';
  
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i].trim();
    if (!cell) continue;
    
    // Check if this is a dice roll marker: "#2-", "$5-", ">3-", "4-", "10-", "12-"
    const diceMatch = cell.match(/^([#$>]*)(\d+)-$/);
    if (diceMatch) {
      // Flush any pending outcome from the previous dice roll
      if (lastOutcomeText && currentDice > 0) {
        // Check if next cell is a sub-range
        // (already handled below)
      }
      
      // Finalize previous dice roll's outcomes
      if (pendingOutcomes.length > 0 && currentDice > 0) {
        for (const po of pendingOutcomes) {
          const type = classifyOutcomeType(po.text);
          const rangeSize = po.rangeEnd - po.rangeStart + 1;
          outcomes.push({
            diceRoll: currentDice,
            isClutch: currentClutch,
            isSuperClutch: currentSuperClutch,
            isImproved: currentImproved,
            type,
            rangeStart: po.rangeStart,
            rangeEnd: po.rangeEnd,
            probability: rangeSize / 20,
            rawText: po.text,
          });
        }
      }
      
      // Start new dice roll
      const markers = diceMatch[1];
      currentDice = parseInt(diceMatch[2]);
      currentClutch = markers.includes('#');
      currentSuperClutch = markers.includes('$');
      currentImproved = markers.includes('>');
      pendingOutcomes = [];
      lastOutcomeText = '';
      continue;
    }
    
    // Check if this is a sub-range: "1-8", "9-20", "1-14"
    const rangeMatch = cell.match(/^(\d+)-(\d+)$/);
    if (rangeMatch && currentDice > 0) {
      const rangeStart = parseInt(rangeMatch[1]);
      const rangeEnd = parseInt(rangeMatch[2]);
      
      // This range applies to the PREVIOUS outcome text
      if (pendingOutcomes.length > 0) {
        // Update the last pending outcome's range
        pendingOutcomes[pendingOutcomes.length - 1].rangeEnd = rangeEnd;
        pendingOutcomes[pendingOutcomes.length - 1].rangeStart = rangeStart;
      }
      continue;
    }
    
    // This must be an outcome text (HR, SINGLE(rf), WALK, strikeout, fly(cf)B, gb(ss)A, etc.)
    if (currentDice > 0) {
      // If there's already a pending outcome without a range, it gets default full range
      // But if a range follows, it'll be updated
      pendingOutcomes.push({
        text: cell,
        rangeStart: 1,
        rangeEnd: 20,
      });
      lastOutcomeText = cell;
    }
  }
  
  // Flush last dice roll
  if (pendingOutcomes.length > 0 && currentDice > 0) {
    for (const po of pendingOutcomes) {
      const type = classifyOutcomeType(po.text);
      const rangeSize = po.rangeEnd - po.rangeStart + 1;
      outcomes.push({
        diceRoll: currentDice,
        isClutch: currentClutch,
        isSuperClutch: currentSuperClutch,
        isImproved: currentImproved,
        type,
        rangeStart: po.rangeStart,
        rangeEnd: po.rangeEnd,
        probability: rangeSize / 20,
        rawText: po.text,
      });
    }
  }
  
  return outcomes;
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
  let totalWeightedValue = 0;
  let totalProbability = 0;
  let clutchHits = 0;
  let clutchPlus = 0;
  let homeRunResults = 0;
  let walkResults = 0;
  let strikeoutResults = 0;
  let hitResults = 0;
  let outResults = 0;
  let totalBases = 0;
  let onBaseEvents = 0;
  
  let vsLWeightedValue = 0;
  let vsLProbability = 0;
  let vsRWeightedValue = 0;
  let vsRProbability = 0;
  
  for (let colIdx = 0; colIdx < Math.min(6, columns.length); colIdx++) {
    const isVsLeft = colIdx < 3;
    const parsed = parseColumn(columns[colIdx]);
    
    for (const outcome of parsed) {
      const value = getOutcomeValue(outcome.type);
      const weightedValue = value * outcome.probability;
      
      totalWeightedValue += weightedValue;
      totalProbability += outcome.probability;
      
      if (isVsLeft) { vsLWeightedValue += weightedValue; vsLProbability += outcome.probability; }
      else { vsRWeightedValue += weightedValue; vsRProbability += outcome.probability; }
      
      if (outcome.isClutch) clutchHits++;
      if (outcome.isSuperClutch) clutchPlus++;
      
      switch (outcome.type) {
        case 'homerun':
          homeRunResults++;
          hitResults++;
          totalBases += 4 * outcome.probability;
          onBaseEvents += outcome.probability;
          break;
        case 'triple':
          hitResults++;
          totalBases += 3 * outcome.probability;
          onBaseEvents += outcome.probability;
          break;
        case 'double':
          hitResults++;
          totalBases += 2 * outcome.probability;
          onBaseEvents += outcome.probability;
          break;
        case 'single':
          hitResults++;
          totalBases += 1 * outcome.probability;
          onBaseEvents += outcome.probability;
          break;
        case 'walk':
          walkResults++;
          onBaseEvents += outcome.probability;
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
  
  // Card score: weighted average value across all outcomes × 100
  const cardScore = totalProbability > 0 ? Math.round((totalWeightedValue / totalProbability) * 100) : 0;
  const onBaseCard = totalProbability > 0 ? Math.round((onBaseEvents / totalProbability) * 1000) / 1000 : 0;
  const sluggingCard = totalProbability > 0 ? Math.round((totalBases / totalProbability) * 1000) / 1000 : 0;
  const vsLScore = vsLProbability > 0 ? Math.round((vsLWeightedValue / vsLProbability) * 100) : 0;
  const vsRScore = vsRProbability > 0 ? Math.round((vsRWeightedValue / vsRProbability) * 100) : 0;
  
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
  let totalProbability = 0;
  let hitResults = 0;
  let outResults = 0;
  let homeRunResults = 0;
  let walkResults = 0;
  let strikeoutResults = 0;
  let groundBalls = 0;
  let vsLWeightedValue = 0;
  let vsLProbability = 0;
  let vsRWeightedValue = 0;
  let vsRProbability = 0;
  
  for (let colIdx = 0; colIdx < Math.min(6, columns.length); colIdx++) {
    const isVsLeft = colIdx < 3;
    const parsed = parseColumn(columns[colIdx]);
    
    for (const outcome of parsed) {
      totalProbability += outcome.probability;
      
      // For pitchers, invert the value: outs are GOOD, hits are BAD
      const pitcherValue = -getOutcomeValue(outcome.type) * outcome.probability;
      if (isVsLeft) { vsLWeightedValue += pitcherValue; vsLProbability += outcome.probability; }
      else { vsRWeightedValue += pitcherValue; vsRProbability += outcome.probability; }
      
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
  
  const cardScore = totalProbability > 0 ? Math.round(((outResults - hitResults) / totalProbability) * 100) : 0;
  const gbRate = outResults > 0 ? Math.round((groundBalls / outResults) * 1000) / 1000 : 0;
  const kRate = totalProbability > 0 ? Math.round((strikeoutResults / totalProbability) * 1000) / 1000 : 0;
  const vsLScore = vsLProbability > 0 ? Math.round((vsLWeightedValue / vsLProbability) * 100) : 0;
  const vsRScore = vsRProbability > 0 ? Math.round((vsRWeightedValue / vsRProbability) * 100) : 0;
  
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
 * Auto-assign a card grade (A+ to F) based on card score
 */
export function computeCardGrade(cardScore: number, type: 'hitter' | 'pitcher'): string {
  if (type === 'hitter') {
    if (cardScore >= 80) return 'A+';
    if (cardScore >= 60) return 'A';
    if (cardScore >= 40) return 'B+';
    if (cardScore >= 25) return 'B';
    if (cardScore >= 10) return 'C+';
    if (cardScore >= 0) return 'C';
    if (cardScore >= -15) return 'D';
    return 'F';
  } else {
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
