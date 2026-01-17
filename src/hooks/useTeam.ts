import { useState, useEffect } from 'react';
import type { Hitter, Pitcher, TeamRoster } from '../types';
import { loadTeams, saveTeams, loadCurrentTeamId, saveCurrentTeamId } from '../utils/storage';

export function useTeam() {
  const [teams, setTeams] = useState<TeamRoster[]>(() => {
    const saved = loadTeams();
    if (saved.length === 0) {
      // Create default team if none exist
      return [{
        id: crypto.randomUUID(),
        name: 'My Team',
        hitters: [],
        pitchers: [],
        totalSalary: 0,
        ballparkStrategy: 'balanced',
      }];
    }
    return saved;
  });

  const [currentTeamId, setCurrentTeamId] = useState<string>(() => {
    const savedId = loadCurrentTeamId();
    return savedId || teams[0]?.id || '';
  });

  const team = teams.find(t => t.id === currentTeamId) || teams[0];

  useEffect(() => {
    saveTeams(teams);
  }, [teams]);

  useEffect(() => {
    if (currentTeamId) {
      saveCurrentTeamId(currentTeamId);
    }
  }, [currentTeamId]);

  const updateCurrentTeam = (updater: (team: TeamRoster) => TeamRoster) => {
    setTeams(prev => prev.map(t => t.id === currentTeamId ? updater(t) : t));
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

  const createNewTeam = (name: string = 'New Team') => {
    const newTeam: TeamRoster = {
      id: crypto.randomUUID(),
      name,
      hitters: [],
      pitchers: [],
      totalSalary: 0,
      ballparkStrategy: 'balanced',
    };
    setTeams(prev => [...prev, newTeam]);
    setCurrentTeamId(newTeam.id);
  };

  const switchTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
  };

  const deleteTeam = (teamId: string) => {
    if (teams.length <= 1) {
      alert('Cannot delete the last team. You must have at least one team.');
      return;
    }
    setTeams(prev => {
      const filtered = prev.filter(t => t.id !== teamId);
      if (currentTeamId === teamId) {
        setCurrentTeamId(filtered[0].id);
      }
      return filtered;
    });
  };

  const duplicateTeam = (teamId: string) => {
    const teamToDuplicate = teams.find(t => t.id === teamId);
    if (!teamToDuplicate) return;
    
    const duplicated: TeamRoster = {
      ...teamToDuplicate,
      id: crypto.randomUUID(),
      name: `${teamToDuplicate.name} (Copy)`,
    };
    setTeams(prev => [...prev, duplicated]);
    setCurrentTeamId(duplicated.id);
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
