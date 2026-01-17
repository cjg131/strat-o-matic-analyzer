import * as XLSX from 'xlsx';
import type { Hitter, Pitcher } from '../types';

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function importHittersFromFile(file: File): Promise<ImportResult<Hitter>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

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
            
            // If PA not provided, calculate it: PA = AB + BB + HBP + SF + SH
            if (plateAppearances === 0) {
              plateAppearances = ab + walks + hitByPitch + sf + sh;
            }

            // Positions come from "Fielding" column (column F)
            const positions = String(normalizedRow.fielding || normalizedRow.f || normalizedRow.pos || normalizedRow.position || normalizedRow.positions || '').trim();

            // Parse fielding range/error as Range(Error) format from a different column, e.g., "2(5)" or "3(+2)"
            let fieldingRange = 0;
            let fieldingError = 0;
            const fieldingStr = String(normalizedRow.defense || normalizedRow.fld || normalizedRow.def || '');
            if (fieldingStr) {
              const match = fieldingStr.match(/(\d+)\s*\(([+-]?\d+)\)/);
              if (match) {
                fieldingRange = parseInt(match[1]) || 0;
                fieldingError = parseInt(match[2]) || 0;
              }
            }

            const hitter: Hitter = {
              id: crypto.randomUUID(),
              name: String(name),
              season: String(normalizedRow.season || normalizedRow.year || new Date().getFullYear()),
              team: normalizedRow.team || normalizedRow.tm || '',
              positions,
              salary: parseFloat(normalizedRow.salary || normalizedRow.sal || normalizedRow.price || '0') || 0,
              balance: String(normalizedRow.aa || normalizedRow.balance || normalizedRow.bal || 'E').toUpperCase(),
              fieldingRange,
              fieldingError,
              stealRating: (() => {
                // Try different column names
                const stlValue = normalizedRow.stl || normalizedRow.stealrating || normalizedRow.steal || normalizedRow.scsstealing || normalizedRow.stealing;
                if (!stlValue) return undefined;
                
                const stlStr = String(stlValue);
                // Extract letter rating from parentheses like "(B)" or "(AA)"
                const match = stlStr.match(/\(([A-E]+)\)/);
                return match ? match[1] : stlStr;
              })(),
              runRating: (() => {
                // Try different column names for RUN rating
                const runValue = normalizedRow.run || normalizedRow.runrating || normalizedRow.running || normalizedRow.rn;
                if (!runValue) return undefined;
                return String(runValue);
              })(),
              ab,
              h: parseInt(normalizedRow.h || normalizedRow.hits || '0') || 0,
              doubles: parseInt(normalizedRow.doubles || normalizedRow['2b'] || normalizedRow.d || '0') || 0,
              triples: parseInt(normalizedRow.triples || normalizedRow['3b'] || normalizedRow.t || '0') || 0,
              homeRuns: parseInt(normalizedRow.homeruns || normalizedRow.hr || normalizedRow.homeruns || '0') || 0,
              walks,
              hitByPitch,
              stolenBases: parseInt(normalizedRow.stolenbases || normalizedRow.sb || normalizedRow.steals || '0') || 0,
              caughtStealing: parseInt(normalizedRow.caughtstealing || normalizedRow.cs || '0') || 0,
              plateAppearances,
              games: parseInt(normalizedRow.games || normalizedRow.g || '0') || 0,
            };

            hitters.push(hitter);
          } catch (err) {
            errors.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Invalid data'}`);
          }
        });

        resolve({
          success: hitters.length > 0,
          data: hitters,
          errors,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file'],
      });
    };

    reader.readAsBinaryString(file);
  });
}

export function importPitchersFromFile(file: File): Promise<ImportResult<Pitcher>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

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

            // Parse fielding as Range(Error) format for pitchers too
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
              season: String(normalizedRow.season || normalizedRow.year || new Date().getFullYear()),
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

        resolve({
          success: pitchers.length > 0,
          data: pitchers,
          errors,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file'],
      });
    };

    reader.readAsBinaryString(file);
  });
}

export function exportHittersToExcel(hitters: Hitter[]): void {
  const worksheet = XLSX.utils.json_to_sheet(hitters.map(h => ({
    Name: h.name,
    Season: h.season,
    Team: h.team,
    Positions: h.positions,
    Salary: h.salary,
    Balance: h.balance,
    STL: h.stealRating || '',
    RUN: h.runRating || '',
    F: h.fieldingRange && h.fieldingError !== undefined ? `${h.fieldingRange}(${h.fieldingError >= 0 ? '+' : ''}${h.fieldingError})` : '',
    AB: h.ab,
    H: h.h,
    '2B': h.doubles,
    '3B': h.triples,
    HR: h.homeRuns,
    BB: h.walks,
    HBP: h.hitByPitch,
    SB: h.stolenBases,
    CS: h.caughtStealing,
    PA: h.plateAppearances,
    Games: h.games,
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hitters');
  XLSX.writeFile(workbook, 'hitters.xlsx');
}

export function exportPitchersToExcel(pitchers: Pitcher[]): void {
  const worksheet = XLSX.utils.json_to_sheet(pitchers.map(p => ({
    Name: p.name,
    Season: p.season,
    Team: p.team,
    Salary: p.salary,
    IP: p.inningsPitched,
    K: p.strikeouts,
    BB: p.walks,
    H: p.hitsAllowed,
    HR: p.homeRunsAllowed,
    ER: p.earnedRuns,
    Games: p.games,
    GS: p.gamesStarted,
    T: p.throwingArm,
    Endurance: p.endurance,
    Fielding: p.fieldingRange && p.fieldingError !== undefined ? `${p.fieldingRange}(${p.fieldingError >= 0 ? '+' : ''}${p.fieldingError})` : '',
    Hitting: p.hitting,
    Balk: p.balk,
    WP: p.wildPitch,
    Hold: p.hold,
    Bunting: p.bunting,
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pitchers');
  XLSX.writeFile(workbook, 'pitchers.xlsx');
}

export function importBallparksFromFile(file: File): Promise<ImportResult<any>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const ballparks: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          try {
            const normalizedRow: Record<string, any> = {};
            Object.keys(row).forEach(key => {
              normalizedRow[normalizeHeader(key)] = row[key];
            });

            const name = normalizedRow.name || normalizedRow.ballpark || normalizedRow.park || '';
            if (!name) {
              errors.push(`Row ${index + 2}: Missing ballpark name`);
              return;
            }

            const ballpark = {
              id: crypto.randomUUID(),
              name: String(name),
              team: normalizedRow.team || normalizedRow.tm || '',
              singlesLeft: parseInt(normalizedRow.singlesleft || normalizedRow.singlesl || normalizedRow.singlelh || normalizedRow['1blh'] || '10') || 10,
              singlesRight: parseInt(normalizedRow.singlesright || normalizedRow.singlesr || normalizedRow.singlerh || normalizedRow['1brh'] || '10') || 10,
              homeRunsLeft: parseInt(normalizedRow.homerunsleft || normalizedRow.homerunsl || normalizedRow.hrleft || normalizedRow.hrlh || '10') || 10,
              homeRunsRight: parseInt(normalizedRow.homerunsright || normalizedRow.homerunsr || normalizedRow.hrright || normalizedRow.hrrh || '10') || 10,
            };

            ballparks.push(ballpark);
          } catch (error) {
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        });

        resolve({
          success: errors.length === 0,
          data: ballparks,
          errors,
        });
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [error instanceof Error ? error.message : 'Failed to parse file'],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file'],
      });
    };

    reader.readAsBinaryString(file);
  });
}

export function exportBallparksToExcel(ballparks: any[]): void {
  const worksheet = XLSX.utils.json_to_sheet(ballparks.map(b => ({
    Name: b.name,
    Team: b.team,
    'Singles LH': b.singlesLeft,
    'Singles RH': b.singlesRight,
    'HR LH': b.homeRunsLeft,
    'HR RH': b.homeRunsRight,
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ballparks');
  XLSX.writeFile(workbook, 'ballparks.xlsx');
}
