import type { Hitter, Pitcher } from '../types';
import type { ImportResult } from './importData';

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Helper to detect if a value is an Excel date serial number
function isExcelDateSerial(value: any): boolean {
  // Only filter out pure numeric values that are Excel date serials
  // Don't filter strings like "1-15" which are valid ratings
  if (typeof value === 'number') {
    // Excel date serials are typically between 1 (1900-01-01) and 50000+ (modern dates)
    // Values like 45308 are definitely date serials (around year 2024)
    return value > 1000 && value < 100000;
  }
  if (typeof value === 'string') {
    // If string contains non-numeric characters (like dashes), it's not a date serial
    if (/[^0-9.]/.test(value)) {
      return false;
    }
    // Only filter if it's a pure number string that looks like a date serial
    const num = parseFloat(value);
    return !isNaN(num) && num > 1000 && num < 100000;
  }
  return false;
}

function parseFieldingString(fieldingStr: string): { positions: string; defensivePositions: any[] } {
  const defensivePositions: any[] = [];
  const positionList: string[] = [];
  
  if (!fieldingStr || fieldingStr.trim() === '') {
    return { positions: '', defensivePositions: [] };
  }

  const entries = fieldingStr.split(/[\/,]/).map(s => s.trim());

  entries.forEach(entry => {
    if (!entry) return;

    const hasDash = entry.includes('-');
    
    if (!hasDash) {
      const position = entry.toLowerCase();
      positionList.push(position);
      defensivePositions.push({
        position,
        range: 0,
        arm: undefined,
        error: 0,
        throwingRating: undefined
      });
      return;
    }

    const posMatch = entry.match(/^([a-z0-9]+)-/i);
    if (!posMatch) return;
    
    const position = posMatch[1].toLowerCase();
    positionList.push(position);

    const rangeMatch = entry.match(/-(\d+)/);
    const range = rangeMatch ? parseInt(rangeMatch[1]) : 0;

    let arm: number | undefined = undefined;
    const isOutfielder = ['lf', 'cf', 'rf'].includes(position);
    const isCatcher = position === 'c';
    
    if (isOutfielder || isCatcher) {
      const armMatch = entry.match(/\(([+-]?\d+)\)/);
      if (armMatch) {
        arm = parseInt(armMatch[1]);
      }
    }

    const errorMatch = entry.match(/e(\d+)/);
    const error = errorMatch ? parseInt(errorMatch[1]) : 0;

    let throwingRating: string | undefined = undefined;
    if (isCatcher) {
      const throwingMatch = entry.match(/T-\d+\(pb-\d+\)/);
      if (throwingMatch) {
        throwingRating = throwingMatch[0];
      }
    }

    defensivePositions.push({
      position,
      range,
      arm,
      error,
      throwingRating
    });
  });

  return {
    positions: positionList.join(', '),
    defensivePositions
  };
}

export function processHittersFromRawData(jsonData: any[]): ImportResult<Hitter> {
  const hitters: Hitter[] = [];
  const errors: string[] = [];

  jsonData.forEach((row: any, index: number) => {
    try {
      const normalizedRow: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        normalizedRow[normalizeHeader(key)] = row[key];
      });

      const name = normalizedRow.name || normalizedRow.player || normalizedRow.playername || '';
      if (!name) {
        errors.push(`Row ${index + 2}: Missing player name`);
        return;
      }

      const ab = parseInt(normalizedRow.ab || '0') || 0;
      const walks = parseInt(normalizedRow.walks || normalizedRow.bb || normalizedRow.walk || '0') || 0;
      const hitByPitch = parseInt(normalizedRow.hitbypitch || normalizedRow.hbp || '0') || 0;
      const sf = parseInt(normalizedRow.sf || normalizedRow.sacrificeflies || '0') || 0;
      const sh = parseInt(normalizedRow.sh || normalizedRow.sacrificehits || '0') || 0;
      
      let plateAppearances = parseInt(normalizedRow.plateappearances || normalizedRow.pa || '0') || 0;
      
      if (plateAppearances === 0) {
        plateAppearances = ab + walks + hitByPitch + sf + sh;
      }

      const fieldingStr = String(normalizedRow.fielding || normalizedRow.f || normalizedRow.pos || normalizedRow.position || normalizedRow.positions || '').trim();
      const { positions, defensivePositions } = parseFieldingString(fieldingStr);

      let fieldingRange = 0;
      let fieldingError = 0;
      if (defensivePositions.length > 0) {
        fieldingRange = defensivePositions[0].range;
        fieldingError = defensivePositions[0].error;
      }

      const hitter: Hitter = {
        id: crypto.randomUUID(),
        name: String(name),
        season: String(normalizedRow.yr || normalizedRow.year || normalizedRow.season || ''),
        team: normalizedRow.team || normalizedRow.tm || '',
        positions,
        defensivePositions,
        salary: parseFloat(normalizedRow.salary || normalizedRow.sal || normalizedRow.price || '0') || 0,
        balance: String(normalizedRow.aa || normalizedRow.balance || normalizedRow.bal || 'E').toUpperCase(),
        fieldingRange,
        fieldingError,
        stealRating: (() => {
          const stlValue = normalizedRow.stl || normalizedRow.stealrating || normalizedRow.steal || normalizedRow.scsstealing || normalizedRow.stealing;
          if (!stlValue) return undefined;
          
          // Filter out Excel date serial numbers
          if (isExcelDateSerial(stlValue)) {
            return undefined;
          }
          
          const stlStr = String(stlValue);
          const match = stlStr.match(/\(([A-E]+)\)/);
          return match ? match[1] : stlStr;
        })(),
        runRating: (() => {
          const runValue = normalizedRow.run || normalizedRow.runrating || normalizedRow.running || normalizedRow.rn;
          if (!runValue) return undefined;
          
          // Filter out Excel date serial numbers
          if (isExcelDateSerial(runValue)) {
            return undefined;
          }
          
          return String(runValue);
        })(),
        plateAppearances,
        ab,
        h: parseInt(normalizedRow.h || normalizedRow.hits || '0') || 0,
        doubles: parseInt(normalizedRow.doubles || normalizedRow['2b'] || '0') || 0,
        triples: parseInt(normalizedRow.triples || normalizedRow['3b'] || '0') || 0,
        homeRuns: parseInt(normalizedRow.homeruns || normalizedRow.hr || '0') || 0,
        walks,
        hitByPitch,
        stolenBases: parseInt(normalizedRow.stolenbases || normalizedRow.sb || '0') || 0,
        caughtStealing: parseInt(normalizedRow.caughtstealing || normalizedRow.cs || '0') || 0,
        games: parseInt(normalizedRow.games || normalizedRow.g || '0') || 0,
        ba: parseFloat(normalizedRow.ba || normalizedRow.avg || normalizedRow.battingaverage || '0') || undefined,
        obp: parseFloat(normalizedRow.obp || normalizedRow.onbasepercentage || '0') || undefined,
        slg: parseFloat(normalizedRow.slg || normalizedRow.slugging || normalizedRow.sluggingpercentage || '0') || undefined,
      };

      hitters.push(hitter);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Invalid data'}`);
    }
  });

  return {
    success: hitters.length > 0,
    data: hitters,
    errors,
    rawData: jsonData,
  };
}

export function processPitchersFromRawData(jsonData: any[]): ImportResult<Pitcher> {
  const pitchers: Pitcher[] = [];
  const errors: string[] = [];

  jsonData.forEach((row: any, index: number) => {
    try {
      const normalizedRow: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        normalizedRow[normalizeHeader(key)] = row[key];
      });

      const name = normalizedRow.name || normalizedRow.player || normalizedRow.playername || '';
      if (!name) {
        errors.push(`Row ${index + 2}: Missing player name`);
        return;
      }

      let fieldingRange = 0;
      let fieldingError = 0;
      const fieldingStr = String(normalizedRow.fielding || normalizedRow.defense || normalizedRow.fld || normalizedRow.def || '');
      if (fieldingStr) {
        const match = fieldingStr.match(/(\d+)\s*\(([+-]?\d+)\)/);
        if (match) {
          fieldingRange = parseInt(match[1]) || 0;
          fieldingError = parseInt(match[2]) || 0;
        }
      }

      const pitcher: Pitcher = {
        id: crypto.randomUUID(),
        name: String(name),
        season: String(normalizedRow.yr || normalizedRow.year || normalizedRow.season || ''),
        team: normalizedRow.team || normalizedRow.tm || '',
        salary: parseFloat(normalizedRow.salary || normalizedRow.sal || normalizedRow.price || '0') || 0,
        inningsPitched: parseFloat(normalizedRow.inningspitched || normalizedRow.ip || '0') || 0,
        strikeouts: parseInt(normalizedRow.strikeouts || normalizedRow.k || normalizedRow.so || '0') || 0,
        walks: parseInt(normalizedRow.walks || normalizedRow.bb || normalizedRow.walk || '0') || 0,
        hitsAllowed: parseInt(normalizedRow.hitsallowed || normalizedRow.h || normalizedRow.hits || '0') || 0,
        homeRunsAllowed: parseInt(normalizedRow.homerunsallowed || normalizedRow.hr || normalizedRow.hra || '0') || 0,
        earnedRuns: parseInt(normalizedRow.earnedruns || normalizedRow.er || '0') || 0,
        games: parseInt(normalizedRow.games || normalizedRow.g || '0') || 0,
        gamesStarted: parseInt(normalizedRow.gamesstarted || normalizedRow.gs || '0') || 0,
        throwingArm: String(normalizedRow.t || normalizedRow.throws || normalizedRow.throwingarm || normalizedRow.arm || '').toUpperCase(),
        endurance: String(normalizedRow.endurance || normalizedRow.end || normalizedRow.stamina || '').toUpperCase(),
        fieldingRange,
        fieldingError,
        hitting: String(normalizedRow.hitting || normalizedRow.hit || normalizedRow.bat || '').toUpperCase(),
        balk: parseInt(normalizedRow.balk || normalizedRow.bk || '0') || 0,
        wildPitch: parseInt(normalizedRow.wildpitch || normalizedRow.wp || '0') || 0,
        hold: parseInt(normalizedRow.hold || normalizedRow.hld || '0') || 0,
        bunting: String(normalizedRow.bunting || normalizedRow.bunt || normalizedRow.bnt || '').toUpperCase(),
      };

      pitchers.push(pitcher);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Invalid data'}`);
    }
  });

  return {
    success: pitchers.length > 0,
    data: pitchers,
    errors,
    rawData: jsonData,
  };
}

export function processBallparksFromRawData(jsonData: any[]): ImportResult<any> {
  const ballparks: any[] = [];
  const errors: string[] = [];

  jsonData.forEach((row: any, index: number) => {
    try {
      const normalizedRow: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        normalizedRow[normalizeHeader(key)] = row[key];
      });

      // Debug logging for first row
      if (index === 0) {
        console.log('[Ballpark Import] First row normalized keys:', Object.keys(normalizedRow));
        console.log('[Ballpark Import] Sample values:', {
          singlesl: normalizedRow.singlesl,
          singlesr: normalizedRow.singlesr,
          homerunsl: normalizedRow.homerunsl,
          homerunsr: normalizedRow.homerunsr,
        });
      }

      const name = normalizedRow.name || normalizedRow.ballpark || normalizedRow.park || '';
      if (!name) {
        errors.push(`Row ${index + 2}: Missing ballpark name`);
        return;
      }

      const singlesLeft = parseInt(normalizedRow.singlesl || normalizedRow.singleleft || normalizedRow['1bl'] || '0') || 0;
      const singlesRight = parseInt(normalizedRow.singlesr || normalizedRow.singleright || normalizedRow['1br'] || '0') || 0;
      const homeRunsLeft = parseInt(normalizedRow.homerunsl || normalizedRow.homerunleft || normalizedRow.hrl || '0') || 0;
      const homeRunsRight = parseInt(normalizedRow.homerunsr || normalizedRow.homerunright || normalizedRow.hrr || '0') || 0;
      
      // Calculate strategic ratings
      const offenseRating = Number(((singlesLeft + singlesRight + homeRunsLeft * 3 + homeRunsRight * 3) / 8).toFixed(1));
      const defenseRating = Number((((42 - singlesLeft - singlesRight) + (42 - homeRunsLeft - homeRunsRight) * 3) / 8).toFixed(1));
      const speedDefenseRating = Number((((singlesLeft + singlesRight) / 2) + ((42 - homeRunsLeft - homeRunsRight) * 3 / 2)).toFixed(1));

      const ballpark = {
        id: crypto.randomUUID(),
        name: String(name),
        singlesLeft,
        singlesRight,
        homeRunsLeft,
        homeRunsRight,
        offenseRating,
        defenseRating,
        speedDefenseRating,
      };

      ballparks.push(ballpark);
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    success: errors.length === 0,
    data: ballparks,
    errors,
    rawData: jsonData,
  };
}
