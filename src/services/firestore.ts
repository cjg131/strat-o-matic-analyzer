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
  // Firestore batch limit is 500 operations, so chunk if needed
  const BATCH_SIZE = 500;
  const DELAY_MS = 1000; // 1 second delay between batches to avoid quota limits
  
  for (let i = 0; i < hitters.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = hitters.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(hitter => {
      const hitterRef = doc(db, getUserPath(userId, 'hitters'), hitter.id);
      batch.set(hitterRef, sanitizeData(hitter));
    });
    
    await batch.commit();
    console.log(`[saveMultipleHitters] Saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} hitters)`);
    
    // Add delay between batches to avoid quota limits (except for last batch)
    if (i + BATCH_SIZE < hitters.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log(`[saveMultipleHitters] ✓ Total saved: ${hitters.length} hitters`);
};

export const clearAllHitters = async (userId: string): Promise<void> => {
  const hittersRef = collection(db, getUserPath(userId, 'hitters'));
  const snapshot = await getDocs(hittersRef);
  
  // Firestore batch limit is 500 operations, so chunk if needed
  const BATCH_SIZE = 500;
  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`[clearAllHitters] Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} hitters)`);
  }
  
  console.log(`[clearAllHitters] ✓ Total deleted: ${docs.length} hitters`);
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
  // Firestore batch limit is 500 operations, so chunk if needed
  const BATCH_SIZE = 500;
  const DELAY_MS = 1000; // 1 second delay between batches to avoid quota limits
  
  for (let i = 0; i < pitchers.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = pitchers.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(pitcher => {
      const pitcherRef = doc(db, getUserPath(userId, 'pitchers'), pitcher.id);
      batch.set(pitcherRef, sanitizeData(pitcher));
    });
    
    await batch.commit();
    console.log(`[saveMultiplePitchers] Saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} pitchers)`);
    
    // Add delay between batches to avoid quota limits (except for last batch)
    if (i + BATCH_SIZE < pitchers.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log(`[saveMultiplePitchers] ✓ Total saved: ${pitchers.length} pitchers`);
};

export const clearAllPitchers = async (userId: string): Promise<void> => {
  const pitchersRef = collection(db, getUserPath(userId, 'pitchers'));
  const snapshot = await getDocs(pitchersRef);
  
  // Firestore batch limit is 500 operations, so chunk if needed
  const BATCH_SIZE = 500;
  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`[clearAllPitchers] Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} pitchers)`);
  }
  
  console.log(`[clearAllPitchers] ✓ Total deleted: ${docs.length} pitchers`);
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
  // Firestore batch limit is 500 operations, so chunk if needed
  const BATCH_SIZE = 500;
  const DELAY_MS = 1000; // 1 second delay between batches to avoid quota limits
  
  for (let i = 0; i < ballparks.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = ballparks.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(ballpark => {
      const ballparkRef = doc(db, getUserPath(userId, 'ballparks'), ballpark.id);
      batch.set(ballparkRef, sanitizeData(ballpark));
    });
    
    await batch.commit();
    console.log(`[saveMultipleBallparks] Saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} ballparks)`);
    
    // Add delay between batches to avoid quota limits (except for last batch)
    if (i + BATCH_SIZE < ballparks.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log(`[saveMultipleBallparks] Total saved: ${ballparks.length} ballparks`);
};

export const deleteBallpark = async (userId: string, ballparkId: string): Promise<void> => {
  const ballparkRef = doc(db, getUserPath(userId, 'ballparks'), ballparkId);
  await deleteDoc(ballparkRef);
};

export const clearAllBallparks = async (userId: string): Promise<void> => {
  const ballparksRef = collection(db, getUserPath(userId, 'ballparks'));
  const snapshot = await getDocs(ballparksRef);
  
  // Firestore batch limit is 500 operations, so chunk if needed
  const BATCH_SIZE = 500;
  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`[clearAllBallparks] Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} ballparks)`);
  }
  
  console.log(`[clearAllBallparks] Total deleted: ${docs.length} ballparks`);
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
  
  console.log(`[saveRawImportData] Starting save for ${importData.type}:`, {
    filename: importData.filename,
    totalRows: rawData.length,
    userId: userId.substring(0, 8) + '...'
  });
  
  // Split rawData into chunks
  const chunks: any[][] = [];
  for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
    chunks.push(rawData.slice(i, i + CHUNK_SIZE));
  }
  
  console.log(`[saveRawImportData] Split into ${chunks.length} chunks (${CHUNK_SIZE} rows per chunk)`);
  
  // Save metadata
  const metadataRef = doc(db, getUserPath(userId, 'rawImports'), importData.id);
  await setDoc(metadataRef, sanitizeData({
    ...metadata,
    chunkCount: chunks.length
  }));
  
  console.log(`[saveRawImportData] Metadata saved for ${importData.id}`);
  
  // Save each chunk
  const batch = writeBatch(db);
  chunks.forEach((chunk, index) => {
    const chunkRef = doc(db, getUserPath(userId, 'rawImports'), `${importData.id}_chunk_${index}`);
    batch.set(chunkRef, sanitizeData({ data: chunk }));
  });
  await batch.commit();
  
  console.log(`[saveRawImportData] ✓ Successfully saved ${chunks.length} chunks for ${importData.type}`);
};

export const getRawImportData = async (userId: string, type: 'hitters' | 'pitchers' | 'ballparks'): Promise<RawImportData | null> => {
  console.log(`[getRawImportData] Retrieving raw data for ${type}, userId: ${userId.substring(0, 8)}...`);
  
  const importsRef = collection(db, getUserPath(userId, 'rawImports'));
  const snapshot = await getDocs(importsRef);
  
  console.log(`[getRawImportData] Found ${snapshot.docs.length} total documents in rawImports`);
  
  // Find the latest metadata document for this type
  const metadataDocs = snapshot.docs
    .filter(doc => !doc.id.includes('_chunk_'))
    .map(doc => ({ id: doc.id, ...doc.data() } as RawImportMetadata))
    .filter(imp => imp.type === type)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  
  console.log(`[getRawImportData] Found ${metadataDocs.length} metadata documents for ${type}`);
  
  if (metadataDocs.length === 0) {
    console.log(`[getRawImportData] No stored data found for ${type}`);
    return null;
  }
  
  const metadata = metadataDocs[0];
  console.log(`[getRawImportData] Using metadata:`, {
    id: metadata.id,
    filename: metadata.filename,
    chunkCount: metadata.chunkCount,
    rowCount: metadata.rowCount
  });
  
  // Retrieve all chunks
  const chunkPromises: Promise<any[]>[] = [];
  for (let i = 0; i < metadata.chunkCount; i++) {
    const chunkRef = doc(db, getUserPath(userId, 'rawImports'), `${metadata.id}_chunk_${i}`);
    chunkPromises.push(
      getDoc(chunkRef).then(chunkDoc => {
        const exists = chunkDoc.exists();
        const data = exists ? (chunkDoc.data().data || []) : [];
        console.log(`[getRawImportData] Chunk ${i}: ${exists ? 'found' : 'missing'}, rows: ${data.length}`);
        return data;
      })
    );
  }
  
  const chunks = await Promise.all(chunkPromises);
  const rawData = chunks.flat();
  
  console.log(`[getRawImportData] ✓ Successfully retrieved ${rawData.length} total rows from ${chunks.length} chunks`);
  
  return {
    id: metadata.id,
    type: metadata.type,
    filename: metadata.filename,
    uploadDate: metadata.uploadDate,
    rowCount: metadata.rowCount,
    rawData
  };
};

// Wanted Players
export const getWantedPlayers = async (userId: string): Promise<any[]> => {
  const wantedRef = collection(db, getUserPath(userId, 'wantedPlayers'));
  const snapshot = await getDocs(wantedRef);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addWantedPlayer = async (userId: string, player: any): Promise<void> => {
  const playerRef = doc(db, getUserPath(userId, 'wantedPlayers'), player.id);
  await setDoc(playerRef, sanitizeData(player));
};

export const removeWantedPlayer = async (userId: string, playerId: string): Promise<void> => {
  const playerRef = doc(db, getUserPath(userId, 'wantedPlayers'), playerId);
  await deleteDoc(playerRef);
};

export const updateWantedPlayerNotes = async (userId: string, playerId: string, notes: string): Promise<void> => {
  const playerRef = doc(db, getUserPath(userId, 'wantedPlayers'), playerId);
  await setDoc(playerRef, { notes }, { merge: true });
};
