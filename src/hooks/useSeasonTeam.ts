import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHitters } from './useHitters';
import { usePitchers } from './usePitchers';
import { subscribeToSeasonTeamName, saveSeasonTeamName } from '../services/firestore';

export function useSeasonTeam() {
  const { currentUser } = useAuth();
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);

  // Subscribe to the persisted season team name
  useEffect(() => {
    if (!currentUser) {
      setSelectedTeamName(null);
      return;
    }

    const unsubscribe = subscribeToSeasonTeamName(currentUser.uid, (teamName) => {
      setSelectedTeamName(teamName);
    });

    return unsubscribe;
  }, [currentUser]);

  // Derive available season teams from the roster field on hitters/pitchers
  const availableTeams = useMemo(() => {
    const teamNames = new Set<string>();
    hitters.forEach(h => {
      if (h.roster && h.roster.trim() !== '') {
        teamNames.add(h.roster);
      }
    });
    pitchers.forEach(p => {
      if (p.roster && p.roster.trim() !== '') {
        teamNames.add(p.roster);
      }
    });
    return Array.from(teamNames).sort();
  }, [hitters, pitchers]);

  // Get team stats for a given team name
  const getTeamStats = (teamName: string) => {
    const teamHitters = hitters.filter(h => h.roster === teamName);
    const teamPitchers = pitchers.filter(p => p.roster === teamName);
    return {
      hitterCount: teamHitters.length,
      pitcherCount: teamPitchers.length,
      totalPlayers: teamHitters.length + teamPitchers.length,
    };
  };

  const selectTeam = async (teamName: string) => {
    if (!currentUser) return;
    await saveSeasonTeamName(currentUser.uid, teamName);
  };

  return {
    selectedTeamName,
    availableTeams,
    selectTeam,
    getTeamStats,
  };
}
