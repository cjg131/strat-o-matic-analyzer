import { 
  collection, 
  doc, 
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
  await setDoc(hitterRef, hitter);
};

export const deleteHitter = async (userId: string, hitterId: string): Promise<void> => {
  const hitterRef = doc(db, getUserPath(userId, 'hitters'), hitterId);
  await deleteDoc(hitterRef);
};

export const saveMultipleHitters = async (userId: string, hitters: Hitter[]): Promise<void> => {
  const batch = writeBatch(db);
  hitters.forEach(hitter => {
    const hitterRef = doc(db, getUserPath(userId, 'hitters'), hitter.id);
    batch.set(hitterRef, hitter);
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
  await setDoc(pitcherRef, pitcher);
};

export const deletePitcher = async (userId: string, pitcherId: string): Promise<void> => {
  const pitcherRef = doc(db, getUserPath(userId, 'pitchers'), pitcherId);
  await deleteDoc(pitcherRef);
};

export const saveMultiplePitchers = async (userId: string, pitchers: Pitcher[]): Promise<void> => {
  const batch = writeBatch(db);
  pitchers.forEach(pitcher => {
    const pitcherRef = doc(db, getUserPath(userId, 'pitchers'), pitcher.id);
    batch.set(pitcherRef, pitcher);
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
    batch.set(teamRef, team);
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
    batch.set(ballparkRef, ballpark);
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
  await setDoc(weightsRef, weights);
};
