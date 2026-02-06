import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHitters } from './useHitters';
import { usePitchers } from './usePitchers';
import { subscribeToSeasonSettings, saveSeasonTeamName, saveSeasonTeamNames } from '../services/firestore';

export function useSeasonTeam() {
  const { currentUser } = useAuth();
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [seasonTeamNames, setSeasonTeamNames] = useState<string[]>([]);

  // Subscribe to persisted season settings (selected team + list of season teams)
  useEffect(() => {
    if (!currentUser) {
      setSelectedTeamName(null);
      setSeasonTeamNames([]);
      return;
    }

    const unsubscribe = subscribeToSeasonSettings(currentUser.uid, (settings) => {
      setSelectedTeamName(settings.seasonTeamName);
      setSeasonTeamNames(settings.seasonTeamNames);
    });

    return unsubscribe;
  }, [currentUser]);

  // Derive available league teams from the roster field on hitters/pitchers
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

  // Select a season team (sets it as the active team)
  const selectTeam = async (teamName: string) => {
    if (!currentUser) return;
    await saveSeasonTeamName(currentUser.uid, teamName);
  };

  // Add a new season team to the list and select it
  const addSeasonTeam = async (teamName: string) => {
    if (!currentUser) return;
    const updated = [...seasonTeamNames];
    if (!updated.includes(teamName)) {
      updated.push(teamName);
      await saveSeasonTeamNames(currentUser.uid, updated);
    }
    await saveSeasonTeamName(currentUser.uid, teamName);
  };

  return {
    selectedTeamName,
    seasonTeamNames,
    availableTeams,
    selectTeam,
    addSeasonTeam,
    getTeamStats,
  };
}
