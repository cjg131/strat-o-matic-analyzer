import { useState, useEffect } from 'react';
import type { Hitter, Pitcher, TeamRoster } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToTeams, 
  saveTeams as saveTeamsToFirestore,
  subscribeToCurrentTeamId,
  saveCurrentTeamId as saveCurrentTeamIdToFirestore
} from '../services/firestore';

export function useTeam() {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<TeamRoster[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string>('');

  // Subscribe to teams
  useEffect(() => {
    if (!currentUser) {
      setTeams([]);
      return;
    }

    const unsubscribe = subscribeToTeams(currentUser.uid, (updatedTeams) => {
      if (updatedTeams.length === 0) {
        // Create default team if none exist
        const defaultTeam: TeamRoster = {
          id: crypto.randomUUID(),
          name: 'My Team',
          hitters: [],
          pitchers: [],
          totalSalary: 0,
          ballparkStrategy: 'balanced',
        };
        saveTeamsToFirestore(currentUser.uid, [defaultTeam]);
      } else {
        setTeams(updatedTeams);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Subscribe to current team ID
  useEffect(() => {
    if (!currentUser) {
      setCurrentTeamId('');
      return;
    }

    const unsubscribe = subscribeToCurrentTeamId(currentUser.uid, (teamId) => {
      if (teamId) {
        setCurrentTeamId(teamId);
      } else if (teams.length > 0) {
        setCurrentTeamId(teams[0].id);
        saveCurrentTeamIdToFirestore(currentUser.uid, teams[0].id);
      }
    });

    return unsubscribe;
  }, [currentUser, teams]);

  const team = teams.find(t => t.id === currentTeamId) || teams[0] || {
    id: '',
    name: 'My Team',
    hitters: [],
    pitchers: [],
    totalSalary: 0,
    ballparkStrategy: 'balanced' as const,
  };

  const updateCurrentTeam = async (updater: (team: TeamRoster) => TeamRoster) => {
    if (!currentUser) return;
    const updatedTeams = teams.map(t => t.id === currentTeamId ? updater(t) : t);
    await saveTeamsToFirestore(currentUser.uid, updatedTeams);
  };

  const addHitter = (hitter: Hitter) => {
    updateCurrentTeam((prev) => {
      const newHitters = [...prev.hitters, hitter];
      const newTotalSalary = calculateTotalSalary(newHitters, prev.pitchers);
      return {
        ...prev,
        hitters: newHitters,
        totalSalary: newTotalSalary,
      };
    });
  };

  const removeHitter = (id: string) => {
    updateCurrentTeam((prev) => {
      const newHitters = prev.hitters.filter((h) => h.id !== id);
      const newTotalSalary = calculateTotalSalary(newHitters, prev.pitchers);
      return {
        ...prev,
        hitters: newHitters,
        totalSalary: newTotalSalary,
      };
    });
  };

  const addPitcher = (pitcher: Pitcher) => {
    updateCurrentTeam((prev) => {
      const newPitchers = [...prev.pitchers, pitcher];
      const newTotalSalary = calculateTotalSalary(prev.hitters, newPitchers);
      return {
        ...prev,
        pitchers: newPitchers,
        totalSalary: newTotalSalary,
      };
    });
  };

  const removePitcher = (id: string) => {
    updateCurrentTeam((prev) => {
      const newPitchers = prev.pitchers.filter((p) => p.id !== id);
      const newTotalSalary = calculateTotalSalary(prev.hitters, newPitchers);
      return {
        ...prev,
        pitchers: newPitchers,
        totalSalary: newTotalSalary,
      };
    });
  };

  const updateTeamName = (name: string) => {
    updateCurrentTeam((prev) => ({ ...prev, name }));
  };

  const clearTeam = () => {
    updateCurrentTeam(() => ({
      id: currentTeamId,
      name: team.name,
      hitters: [],
      pitchers: [],
      totalSalary: 0,
      ballparkStrategy: 'balanced',
    }));
  };

  const setBallpark = (ballpark: TeamRoster['ballpark']) => {
    updateCurrentTeam((prev) => ({ ...prev, ballpark }));
  };

  const setBallparkStrategy = (strategy: TeamRoster['ballparkStrategy']) => {
    updateCurrentTeam((prev) => ({ ...prev, ballparkStrategy: strategy }));
  };

  const createNewTeam = async (name: string = 'New Team') => {
    if (!currentUser) return;
    const newTeam: TeamRoster = {
      id: crypto.randomUUID(),
      name,
      hitters: [],
      pitchers: [],
      totalSalary: 0,
      ballparkStrategy: 'balanced',
    };
    await saveTeamsToFirestore(currentUser.uid, [...teams, newTeam]);
    await saveCurrentTeamIdToFirestore(currentUser.uid, newTeam.id);
  };

  const switchTeam = async (teamId: string) => {
    if (!currentUser) return;
    await saveCurrentTeamIdToFirestore(currentUser.uid, teamId);
  };

  const deleteTeam = async (teamId: string) => {
    if (!currentUser) return;
    if (teams.length <= 1) {
      alert('Cannot delete the last team. You must have at least one team.');
      return;
    }
    const filtered = teams.filter(t => t.id !== teamId);
    await saveTeamsToFirestore(currentUser.uid, filtered);
    if (currentTeamId === teamId) {
      await saveCurrentTeamIdToFirestore(currentUser.uid, filtered[0].id);
    }
  };

  const duplicateTeam = async (teamId: string) => {
    if (!currentUser) return;
    const teamToDuplicate = teams.find(t => t.id === teamId);
    if (!teamToDuplicate) return;
    
    const duplicated: TeamRoster = {
      ...teamToDuplicate,
      id: crypto.randomUUID(),
      name: `${teamToDuplicate.name} (Copy)`,
    };
    await saveTeamsToFirestore(currentUser.uid, [...teams, duplicated]);
    await saveCurrentTeamIdToFirestore(currentUser.uid, duplicated.id);
  };

  return {
    team,
    teams,
    currentTeamId,
    addHitter,
    removeHitter,
    addPitcher,
    removePitcher,
    updateTeamName,
    clearTeam,
    setBallpark,
    setBallparkStrategy,
    createNewTeam,
    switchTeam,
    deleteTeam,
    duplicateTeam,
  };
}

function calculateTotalSalary(hitters: Hitter[], pitchers: Pitcher[]): number {
  const hitterSalary = hitters.reduce((sum, h) => sum + h.salary, 0);
  const pitcherSalary = pitchers.reduce((sum, p) => sum + p.salary, 0);
  return hitterSalary + pitcherSalary;
}
