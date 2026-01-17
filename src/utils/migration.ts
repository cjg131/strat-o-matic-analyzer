import { 
  saveMultipleHitters, 
  saveMultiplePitchers, 
  saveTeams, 
  saveCurrentTeamId,
  saveMultipleBallparks,
  saveScoringWeights 
} from '../services/firestore';
import { 
  loadHitters, 
  loadPitchers, 
  loadTeams, 
  loadCurrentTeamId,
  loadBallparks,
  loadScoringWeights 
} from './storage';

const MIGRATION_KEY = 'strat-o-matic-migrated';

export async function migrateLocalStorageToFirestore(userId: string): Promise<void> {
  // Check if already migrated
  const migrated = localStorage.getItem(MIGRATION_KEY);
  if (migrated === 'true') {
    console.log('Data already migrated to Firestore');
    return;
  }

  console.log('Starting migration from localStorage to Firestore...');

  try {
    // Migrate hitters
    const hitters = loadHitters();
    if (hitters.length > 0) {
      console.log(`Migrating ${hitters.length} hitters...`);
      await saveMultipleHitters(userId, hitters);
    }

    // Migrate pitchers
    const pitchers = loadPitchers();
    if (pitchers.length > 0) {
      console.log(`Migrating ${pitchers.length} pitchers...`);
      await saveMultiplePitchers(userId, pitchers);
    }

    // Migrate teams
    const teams = loadTeams();
    if (teams.length > 0) {
      console.log(`Migrating ${teams.length} teams...`);
      await saveTeams(userId, teams);
    }

    // Migrate current team ID
    const currentTeamId = loadCurrentTeamId();
    if (currentTeamId) {
      console.log('Migrating current team ID...');
      await saveCurrentTeamId(userId, currentTeamId);
    }

    // Migrate ballparks
    const ballparks = loadBallparks();
    if (ballparks.length > 0) {
      console.log(`Migrating ${ballparks.length} ballparks...`);
      await saveMultipleBallparks(userId, ballparks);
    }

    // Migrate scoring weights
    const weights = loadScoringWeights();
    if (weights) {
      console.log('Migrating scoring weights...');
      await saveScoringWeights(userId, weights);
    }

    // Mark as migrated
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}
