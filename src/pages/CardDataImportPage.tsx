import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveMultipleHitters, saveMultiplePitchers, clearAllHitters, clearAllPitchers } from '../services/firestore';
import type { Hitter, Pitcher, DefensivePosition } from '../types';

interface ScrapedHitterBase {
  playerId: string;
  year: string;
  cardType: string;
  name: string;
  team: string;
  bats: string;
  pos: string;
  def: string;
  ab: number;
  r: number;
  h: number;
  doubles: number;
  triples: number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  sb: number;
  cs: number;
  stl: string;
  run: string;
  ba: string;
  obp: string;
  slg: string;
  inj: string;
  bal: string;
  salary: string;
}

interface ScrapedPitcherBase {
  playerId: string;
  year: string;
  cardType: string;
  name: string;
  team: string;
  throws: string;
  endurance: string;
  w: number;
  l: number;
  saves: number;
  ip: string;
  h: number;
  er: number;
  bb: number;
  so: number;
  hr: number;
  hold: string;
  bkr: string;
  wpr: string;
  bat: string;
  era: string;
  whip: string;
  bal: string;
  salary: string;
}

interface ScrapedCardData {
  type: string;
  playerId: string;
  year: string;
  cardType: string;
  name: string;
  pos?: string;
  balance?: string;
  bunting?: string;
  hitAndRun?: string;
  stealRating?: string;
  stealRange?: string;
  defenseRaw?: string;
  running?: string;
  pctVsL?: number;
  pctVsR?: number;
  powerVsL?: string;
  powerVsR?: string;
  columns?: string[][];
  pitcherRating?: number;
  endurance?: number;
  role?: string;
  hold?: number;
  throws?: string;
  balk?: number;
  wp?: number;
  fieldingError?: number;
}

function parseSalary(salaryStr: string): number {
  if (!salaryStr) return 0;
  const cleaned = salaryStr.replace(/[,$]/g, '');
  if (cleaned.endsWith('M')) {
    return parseFloat(cleaned.replace('M', '')) * 1000000;
  }
  if (cleaned.endsWith('K')) {
    return parseFloat(cleaned.replace('K', '')) * 1000;
  }
  return parseFloat(cleaned) || 0;
}

function parseDefensePositions(posStr: string, defStr: string): DefensivePosition[] {
  const positions: DefensivePosition[] = [];
  if (!defStr) return positions;

  // The def string from browse is like "2(-1)e7" (single pos) or more complex
  // The card defenseRaw is like "rf-2(+1)e7 / lf-2(-1)e7 / 1b-4e25"
  // We also know the primary position from posStr

  // Try to parse compound defense strings (from card data)
  const parts = defStr.includes('/') ? defStr.split('/').map(s => s.trim()) : [defStr];

  for (const part of parts) {
    // Match "rf-2(+1)e7" or "2(-1)e7" or "c-3(T-6)e12" or "1b-4e25"
    const match = part.match(/(?:([a-z0-9]+)-)?(\d+)(?:\(([^)]+)\))?e(\d+)/i);
    if (match) {
      const pos = match[1] ? match[1].toLowerCase() : posStr.toLowerCase();
      const range = parseInt(match[2]) || 0;
      const armStr = match[3] || '';
      const error = parseInt(match[4]) || 0;

      const dp: DefensivePosition = { position: pos, range, error };

      if (armStr && !armStr.startsWith('T')) {
        dp.arm = parseInt(armStr) || 0;
      }
      if (armStr && armStr.startsWith('T')) {
        dp.throwingRating = armStr;
      }

      positions.push(dp);
    }
  }

  return positions;
}

function parseIP(ipStr: string): number {
  if (!ipStr) return 0;
  const parts = ipStr.split('.');
  const full = parseInt(parts[0]) || 0;
  const thirds = parseInt(parts[1]) || 0;
  return full + thirds / 3;
}

function mergeHitter(base: ScrapedHitterBase, card?: ScrapedCardData): Hitter {
  const id = base.playerId + '_' + base.year + '_' + base.cardType;
  const salaryNum = parseSalary(base.salary);
  
  // Use card defenseRaw for multi-position parsing if available, fallback to browse def
  const defStr = card?.defenseRaw || base.def;
  const defPositions = parseDefensePositions(base.pos, defStr);
  const pa = base.ab + base.bb;

  const hitter: Hitter = {
    id,
    name: base.name,
    season: base.year,
    team: base.team,
    positions: base.pos,
    defensivePositions: defPositions,
    salary: salaryNum,
    balance: base.bal || card?.balance || '',
    fieldingRange: defPositions.length > 0 ? defPositions[0].range : 0,
    fieldingError: defPositions.length > 0 ? defPositions[0].error : 0,
    stealRating: base.stl || card?.stealRating || '',
    runRating: base.run || card?.running || '',
    ab: base.ab,
    h: base.h,
    doubles: base.doubles,
    triples: base.triples,
    homeRuns: base.hr,
    walks: base.bb,
    hitByPitch: 0,
    stolenBases: base.sb,
    caughtStealing: base.cs,
    plateAppearances: pa,
    games: Math.round(pa / 4.5) || 1,
    ba: parseFloat(base.ba) || 0,
    obp: parseFloat(base.obp) || 0,
    slg: parseFloat(base.slg) || 0,
  };

  if (card && card.columns && card.columns.length > 0) {
    hitter.cardData = {
      powerVsL: card.powerVsL || '',
      powerVsR: card.powerVsR || '',
      pctVsL: card.pctVsL ?? undefined,
      pctVsR: card.pctVsR ?? undefined,
      bunting: card.bunting || '',
      hitAndRun: card.hitAndRun || '',
      stealDetails: card.stealRange || '',
      defenseRaw: card.defenseRaw || '',
      columns: card.columns,
    };
  }

  return hitter;
}

function mergePitcher(base: ScrapedPitcherBase, card?: ScrapedCardData): Pitcher {
  const id = base.playerId + '_' + base.year + '_' + base.cardType;
  const salaryNum = parseSalary(base.salary);
  const ip = parseIP(base.ip);

  const pitcher: Pitcher = {
    id,
    name: base.name,
    season: base.year,
    team: base.team,
    salary: salaryNum,
    inningsPitched: ip,
    strikeouts: base.so,
    walks: base.bb,
    hitsAllowed: base.h,
    homeRunsAllowed: base.hr,
    earnedRuns: base.er,
    games: base.w + base.l + base.saves,
    gamesStarted: base.endurance.includes('S') ? base.w + base.l : 0,
    throwingArm: base.throws || (card?.throws === 'RIGHT' ? 'R' : card?.throws === 'LEFT' ? 'L' : ''),
    endurance: base.endurance || '',
    fieldingRange: 0,
    fieldingError: card?.fieldingError || 0,
    hitting: base.bat || '',
    balk: parseInt(base.bkr) || card?.balk || 0,
    wildPitch: parseInt(base.wpr) || card?.wp || 0,
    hold: parseInt(base.hold) || card?.hold || 0,
    bunting: card?.bunting || '',
  };

  if (card && card.columns && card.columns.length > 0) {
    pitcher.cardData = {
      pitcherRating: card.pitcherRating ?? undefined,
      pctVsL: card.pctVsL ?? undefined,
      pctVsR: card.pctVsR ?? undefined,
      columns: card.columns,
    };
  }

  return pitcher;
}

export default function CardDataImportPage() {
  const { currentUser: user } = useAuth();
  const [status, setStatus] = useState('');
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState({ hitters: 0, pitchers: 0, cardsMatched: 0 });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);
    setStatus('Reading file...');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const baseHitters: ScrapedHitterBase[] = data.baseHitters || [];
      const basePitchers: ScrapedPitcherBase[] = data.basePitchers || [];
      const cards: ScrapedCardData[] = data.cards || [];

      setStatus('Parsed: ' + baseHitters.length + ' hitters, ' + basePitchers.length + ' pitchers, ' + cards.length + ' cards');

      const cardMap = new Map<string, ScrapedCardData>();
      cards.forEach(card => {
        const key = card.playerId + '_' + card.year + '_' + card.cardType;
        cardMap.set(key, card);
      });

      setStatus('Merging hitters...');
      let cardsMatched = 0;
      const hitters: Hitter[] = baseHitters.map(base => {
        const key = base.playerId + '_' + base.year + '_' + base.cardType;
        const card = cardMap.get(key);
        if (card) cardsMatched++;
        return mergeHitter(base, card);
      });

      setStatus('Merging pitchers...');
      const pitchers: Pitcher[] = basePitchers.map(base => {
        const key = base.playerId + '_' + base.year + '_' + base.cardType;
        const card = cardMap.get(key);
        if (card) cardsMatched++;
        return mergePitcher(base, card);
      });

      setStats({ hitters: hitters.length, pitchers: pitchers.length, cardsMatched });
      setStatus('Merged: ' + hitters.length + ' hitters, ' + pitchers.length + ' pitchers (' + cardsMatched + ' cards matched). Ready to upload.');

      const confirmUpload = window.confirm(
        'Upload ' + hitters.length + ' hitters and ' + pitchers.length + ' pitchers to Firestore?\n\n' +
        cardsMatched + ' players have card data.\n\n' +
        'This will REPLACE all existing player data.'
      );

      if (!confirmUpload) {
        setStatus('Upload cancelled.');
        setImporting(false);
        return;
      }

      setStatus('Clearing existing hitters...');
      await clearAllHitters(user.uid);
      setStatus('Clearing existing pitchers...');
      await clearAllPitchers(user.uid);

      setStatus('Uploading ' + hitters.length + ' hitters...');
      await saveMultipleHitters(user.uid, hitters);

      setStatus('Uploading ' + pitchers.length + ' pitchers...');
      await saveMultiplePitchers(user.uid, pitchers);

      setStatus('Done! Uploaded ' + hitters.length + ' hitters and ' + pitchers.length + ' pitchers (' + cardsMatched + ' with card data).');
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Card Data Import</h1>
      <p className="text-gray-600 mb-6">
        Upload the JSON export from the Strat-O-Matic 365 scraper to merge base stats
        with card data and upload everything to Firestore.
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Upload Scraped Data</h2>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={importing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {status && (
        <div className={'rounded-lg p-4 mb-6 ' + (importing ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200')}>
          <p className="text-sm">{status}</p>
        </div>
      )}

      {stats.hitters > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Import Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.hitters}</div>
              <div className="text-sm text-gray-500">Hitters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.pitchers}</div>
              <div className="text-sm text-gray-500">Pitchers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.cardsMatched}</div>
              <div className="text-sm text-gray-500">Cards Matched</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
