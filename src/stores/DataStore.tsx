import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Player } from "../data/players";
import { MatchResult } from "../types/match";
import { sanityClient } from "../sanity-client";
import { allPlayersQuery, allMatchesQuery } from "../data-utils";
import {
  calculateTrueSkillRatings,
  updatePlayersWithTrueSkill,
  calculateEnhancedAverage,
} from "../trueskill-utils";
import { updatePlayersWithMatchStats } from "../match-stats-utils";

interface DataState {
  players: Player[];
  matches: MatchResult[];
  loading: boolean;
  error: string | null;
}

interface DataContextType extends DataState {
  refreshData: () => Promise<void>;
  getNonGuestPlayers: () => Player[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, setState] = useState<DataState>({
    players: [],
    matches: [],
    loading: true,
    error: null,
  });

  const fetchAndProcessData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch both players and matches
      const [playersData, matchesData] = await Promise.all([
        sanityClient.fetch(allPlayersQuery(true)),
        sanityClient.fetch(allMatchesQuery),
      ]);

      // Sort players alphabetically
      playersData.sort((a: Player, b: Player) => a.name.localeCompare(b.name));

      // Calculate TrueSkill ratings first
      calculateTrueSkillRatings(matchesData);

      // Update players with TrueSkill μ values and match statistics
      const playersWithTrueSkill = updatePlayersWithTrueSkill(playersData);
      const playersWithStats = updatePlayersWithMatchStats(
        playersWithTrueSkill,
        matchesData,
      );

      // Pre-calculate enhanced averages and other derived attributes
      const playersWithDerivedData = playersWithStats.map((player) => ({
        ...player,
        enhancedAverage: calculateEnhancedAverage(player),
        winRate: player.matchStats?.winRate || 0,
        currentStreak: player.matchStats?.currentStreak || "0",
      }));

      setState({
        players: playersWithDerivedData,
        matches: matchesData,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  };

  useEffect(() => {
    fetchAndProcessData();
  }, []);

  const getNonGuestPlayers = (): Player[] => {
    return state.players.filter((player) => !player.isGuest);
  };

  const contextValue: DataContextType = {
    ...state,
    refreshData: fetchAndProcessData,
    getNonGuestPlayers,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
