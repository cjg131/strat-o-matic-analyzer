import * as XLSX from 'xlsx';
import type { Hitter, Pitcher } from '../types';
import { processHittersFromRawData, processPitchersFromRawData, processBallparksFromRawData } from './processRawData';

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  rawData?: any[];
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

        const result = processHittersFromRawData(jsonData);
        resolve(result);
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

        const result = processPitchersFromRawData(jsonData);
        resolve(result);
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

        const result = processBallparksFromRawData(jsonData);
        resolve(result);
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
