import { Player } from "./data/players";
import { MatchResult, MatchOutcomeLetter } from "./types/match";

export interface MatchResultWithId {
  result: MatchOutcomeLetter;
  MatchId: string;
}

export interface PlayerMatchStats {
  winRate: number; // Percentage of wins (0-100)
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  allResults: MatchResultWithId[]; // All match results with IDs, chronologically ordered
  currentStreak: string; // Current streak (e.g., "2W", "5D", "1L")
}

// Calculate match statistics for a specific player
export const calculatePlayerMatchStats = (
  playerId: string,
  matches: MatchResult[],
): PlayerMatchStats => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  const results: MatchResultWithId[] = [];

  // Process matches chronologically (oldest first) to get correct order
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  sortedMatches.forEach((match) => {
    const isInLocalTeam = match.localTeam.some(
      (player) => player._id === playerId,
    );
    const isInAwayTeam = match.awayTeam.some(
      (player) => player._id === playerId,
    );

    if (!isInLocalTeam && !isInAwayTeam) {
      return; // Player not in this match
    }

    let result: MatchOutcomeLetter;

    if (match.result === "draw") {
      result = "D";
      draws++;
    } else if (
      (isInLocalTeam && match.result === "white") ||
      (isInAwayTeam && match.result === "dark")
    ) {
      result = "W";
      wins++;
    } else {
      result = "L";
      losses++;
    }

    results.push({
      result,
      MatchId: match._id,
    });
  });

  const totalMatches = wins + draws + losses;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  // Calculate current streak
  let currentStreak = "0";
  if (results.length > 0) {
    const lastResult = results[results.length - 1].result; // Most recent result
    let streakCount = 1;

    // Count consecutive same results from the end
    for (let i = results.length - 2; i >= 0; i--) {
      if (results[i].result === lastResult) {
        streakCount++;
      } else {
        break;
      }
    }

    currentStreak = `${streakCount}${lastResult}`;
  }

  return {
    winRate,
    totalMatches,
    wins,
    draws,
    losses,
    allResults: results, // Store all results with IDs
    currentStreak,
  };
};

// Calculate match statistics for all players
export const calculateAllPlayersMatchStats = (
  players: Player[],
  matches: MatchResult[],
): Map<string, PlayerMatchStats> => {
  const statsMap = new Map<string, PlayerMatchStats>();

  players.forEach((player) => {
    const stats = calculatePlayerMatchStats(player._id, matches);
    statsMap.set(player._id, stats);
  });

  return statsMap;
};

// Update players with their match statistics
export const updatePlayersWithMatchStats = (
  players: Player[],
  matches: MatchResult[],
): Player[] => {
  const statsMap = calculateAllPlayersMatchStats(players, matches);

  return players.map((player) => {
    const stats = statsMap.get(player._id);
    return {
      ...player,
      matchStats: stats,
    };
  });
};
