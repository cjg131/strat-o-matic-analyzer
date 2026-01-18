import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Hitter, Pitcher, TeamRoster, ScoringWeights, Ballpark } from '../types';

// Collection paths for user data
const getUserPath = (userId: string, collectionName: string) => {
  return `users/${userId}/${collectionName}`;
};

// Sanitize data to remove undefined values (Firestore doesn't support undefined)
const sanitizeData = <T extends Record<string, any>>(data: T): any => {
  const sanitized: any = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    } else if (sanitized[key] !== null && typeof sanitized[key] === 'object' && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeData(sanitized[key]);
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) => 
        typeof item === 'object' && item !== null ? sanitizeData(item) : item
      );
    }
  });
  return sanitized;
};

// Hitters
export const subscribeToHitters = (
  userId: string, 
  callback: (hitters: Hitter[]) => void
): Unsubscribe => {
  const hittersRef = collection(db, getUserPath(userId, 'hitters'));
  return onSnapshot(hittersRef, (snapshot) => {
    const hitters = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Hitter));
    callback(hitters);
  });
};

export const saveHitter = async (userId: string, hitter: Hitter): Promise<void> => {
  const hitterRef = doc(db, getUserPath(userId, 'hitters'), hitter.id);
  await setDoc(hitterRef, sanitizeData(hitter));
};

export const deleteHitter = async (userId: string, hitterId: string): Promise<void> => {
  const hitterRef = doc(db, getUserPath(userId, 'hitters'), hitterId);
  await deleteDoc(hitterRef);
};

export const saveMultipleHitters = async (userId: string, hitters: Hitter[]): Promise<void> => {
  const batch = writeBatch(db);
  hitters.forEach(hitter => {
    const hitterRef = doc(db, getUserPath(userId, 'hitters'), hitter.id);
    batch.set(hitterRef, sanitizeData(hitter));
  });
  await batch.commit();
};

export const clearAllHitters = async (userId: string): Promise<void> => {
  const hittersRef = collection(db, getUserPath(userId, 'hitters'));
  const snapshot = await getDocs(hittersRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};

// Pitchers
export const subscribeToPitchers = (
  userId: string, 
  callback: (pitchers: Pitcher[]) => void
): Unsubscribe => {
  const pitchersRef = collection(db, getUserPath(userId, 'pitchers'));
  return onSnapshot(pitchersRef, (snapshot) => {
    const pitchers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Pitcher));
    callback(pitchers);
  });
};

export const savePitcher = async (userId: string, pitcher: Pitcher): Promise<void> => {
  const pitcherRef = doc(db, getUserPath(userId, 'pitchers'), pitcher.id);
  await setDoc(pitcherRef, sanitizeData(pitcher));
};

export const deletePitcher = async (userId: string, pitcherId: string): Promise<void> => {
  const pitcherRef = doc(db, getUserPath(userId, 'pitchers'), pitcherId);
  await deleteDoc(pitcherRef);
};

export const saveMultiplePitchers = async (userId: string, pitchers: Pitcher[]): Promise<void> => {
  const batch = writeBatch(db);
  pitchers.forEach(pitcher => {
    const pitcherRef = doc(db, getUserPath(userId, 'pitchers'), pitcher.id);
    batch.set(pitcherRef, sanitizeData(pitcher));
  });
  await batch.commit();
};

export const clearAllPitchers = async (userId: string): Promise<void> => {
  const pitchersRef = collection(db, getUserPath(userId, 'pitchers'));
  const snapshot = await getDocs(pitchersRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};

// Teams
export const subscribeToTeams = (
  userId: string, 
  callback: (teams: TeamRoster[]) => void
): Unsubscribe => {
  const teamsRef = collection(db, getUserPath(userId, 'teams'));
  return onSnapshot(teamsRef, (snapshot) => {
    const teams = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeamRoster));
    callback(teams);
  });
};

export const saveTeams = async (userId: string, teams: TeamRoster[]): Promise<void> => {
  const batch = writeBatch(db);
  teams.forEach(team => {
    const teamRef = doc(db, getUserPath(userId, 'teams'), team.id);
    batch.set(teamRef, sanitizeData(team));
  });
  await batch.commit();
};

export const deleteTeam = async (userId: string, teamId: string): Promise<void> => {
  const teamRef = doc(db, getUserPath(userId, 'teams'), teamId);
  await deleteDoc(teamRef);
};

// Current Team ID
export const subscribeToCurrentTeamId = (
  userId: string,
  callback: (teamId: string | null) => void
): Unsubscribe => {
  const settingsRef = doc(db, getUserPath(userId, 'settings'), 'current');
  return onSnapshot(settingsRef, (snapshot) => {
    const data = snapshot.data();
    callback(data?.currentTeamId || null);
  });
};

export const saveCurrentTeamId = async (userId: string, teamId: string): Promise<void> => {
  const settingsRef = doc(db, getUserPath(userId, 'settings'), 'current');
  await setDoc(settingsRef, { currentTeamId: teamId }, { merge: true });
};

// Ballparks
export const subscribeToBallparks = (
  userId: string, 
  callback: (ballparks: Ballpark[]) => void
): Unsubscribe => {
  const ballparksRef = collection(db, getUserPath(userId, 'ballparks'));
  return onSnapshot(ballparksRef, (snapshot) => {
    const ballparks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ballpark));
    callback(ballparks);
  });
};

export const saveMultipleBallparks = async (userId: string, ballparks: Ballpark[]): Promise<void> => {
  const batch = writeBatch(db);
  ballparks.forEach(ballpark => {
    const ballparkRef = doc(db, getUserPath(userId, 'ballparks'), ballpark.id);
    batch.set(ballparkRef, sanitizeData(ballpark));
  });
  await batch.commit();
};

export const deleteBallpark = async (userId: string, ballparkId: string): Promise<void> => {
  const ballparkRef = doc(db, getUserPath(userId, 'ballparks'), ballparkId);
  await deleteDoc(ballparkRef);
};

export const clearAllBallparks = async (userId: string): Promise<void> => {
  const ballparksRef = collection(db, getUserPath(userId, 'ballparks'));
  const snapshot = await getDocs(ballparksRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};

// Scoring Weights
export const subscribeToScoringWeights = (
  userId: string,
  callback: (weights: ScoringWeights | null) => void
): Unsubscribe => {
  const weightsRef = doc(db, getUserPath(userId, 'settings'), 'scoringWeights');
  return onSnapshot(weightsRef, (snapshot) => {
    const data = snapshot.data();
    callback(data ? data as ScoringWeights : null);
  });
};

export const saveScoringWeights = async (userId: string, weights: ScoringWeights): Promise<void> => {
  const weightsRef = doc(db, getUserPath(userId, 'settings'), 'scoringWeights');
  await setDoc(weightsRef, sanitizeData(weights));
};

// Raw Import Data Storage
export interface RawImportData {
  id: string;
  type: 'hitters' | 'pitchers' | 'ballparks';
  filename: string;
  uploadDate: string;
  rowCount: number;
  rawData: any[];
}

interface RawImportMetadata {
  id: string;
  type: 'hitters' | 'pitchers' | 'ballparks';
  filename: string;
  uploadDate: string;
  rowCount: number;
  chunkCount: number;
}

const CHUNK_SIZE = 100; // Store 100 rows per chunk to stay well under 1MB limit

export const saveRawImportData = async (userId: string, importData: RawImportData): Promise<void> => {
  const { rawData, ...metadata } = importData;
  
  // Split rawData into chunks
  const chunks: any[][] = [];
  for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
    chunks.push(rawData.slice(i, i + CHUNK_SIZE));
  }
  
  // Save metadata
  const metadataRef = doc(db, getUserPath(userId, 'rawImports'), importData.id);
  await setDoc(metadataRef, sanitizeData({
    ...metadata,
    chunkCount: chunks.length
  }));
  
  // Save each chunk
  const batch = writeBatch(db);
  chunks.forEach((chunk, index) => {
    const chunkRef = doc(db, getUserPath(userId, 'rawImports'), `${importData.id}_chunk_${index}`);
    batch.set(chunkRef, sanitizeData({ data: chunk }));
  });
  await batch.commit();
};

export const getRawImportData = async (userId: string, type: 'hitters' | 'pitchers' | 'ballparks'): Promise<RawImportData | null> => {
  const importsRef = collection(db, getUserPath(userId, 'rawImports'));
  const snapshot = await getDocs(importsRef);
  
  // Find the latest metadata document for this type
  const metadataDocs = snapshot.docs
    .filter(doc => !doc.id.includes('_chunk_'))
    .map(doc => ({ id: doc.id, ...doc.data() } as RawImportMetadata))
    .filter(imp => imp.type === type)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  
  if (metadataDocs.length === 0) return null;
  
  const metadata = metadataDocs[0];
  
  // Retrieve all chunks
  const chunkPromises: Promise<any[]>[] = [];
  for (let i = 0; i < metadata.chunkCount; i++) {
    const chunkRef = doc(db, getUserPath(userId, 'rawImports'), `${metadata.id}_chunk_${i}`);
    chunkPromises.push(
      getDoc(chunkRef).then(chunkDoc => {
        return chunkDoc.exists() ? (chunkDoc.data().data || []) : [];
      })
    );
  }
  
  const chunks = await Promise.all(chunkPromises);
  const rawData = chunks.flat();
  
  return {
    id: metadata.id,
    type: metadata.type,
    filename: metadata.filename,
    uploadDate: metadata.uploadDate,
    rowCount: metadata.rowCount,
    rawData
  };
};
