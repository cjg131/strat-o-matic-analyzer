import { useState, useEffect } from 'react';
import type { Hitter, Pitcher, TeamRoster } from '../types';
import { loadTeam, saveTeam } from '../utils/storage';

export function useTeam() {
  const [team, setTeam] = useState<TeamRoster>(() => {
    const saved = loadTeam();
    return saved || {
      id: crypto.randomUUID(),
      name: 'My Team',
      hitters: [],
      pitchers: [],
      totalSalary: 0,
    };
  });

  useEffect(() => {
    saveTeam(team);
  }, [team]);

  const addHitter = (hitter: Hitter) => {
    setTeam((prev) => {
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
    setTeam((prev) => {
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
    setTeam((prev) => {
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
    setTeam((prev) => {
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
    setTeam((prev) => ({ ...prev, name }));
  };

  const clearTeam = () => {
    setTeam({
      id: crypto.randomUUID(),
      name: 'My Team',
      hitters: [],
      pitchers: [],
      totalSalary: 0,
    });
  };

  return {
    team,
    addHitter,
    removeHitter,
    addPitcher,
    removePitcher,
    updateTeamName,
    clearTeam,
  };
}

function calculateTotalSalary(hitters: Hitter[], pitchers: Pitcher[]): number {
  const hitterSalary = hitters.reduce((sum, h) => sum + h.salary, 0);
  const pitcherSalary = pitchers.reduce((sum, p) => sum + p.salary, 0);
  return hitterSalary + pitcherSalary;
}
