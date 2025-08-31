import { TrueSkill, Rating } from "ts-trueskill";
import { Player } from "./data/players";
import { TRUESKILL_CONSTANTS } from "./constants";
import { MatchResult } from "./types/match";
export interface PlayerTrueSkill {
  playerId: string;
  playerName: string;
  mu: number; // TrueSkill rating (μ)
  sigma: number; // TrueSkill uncertainty (σ)
  conservativeRating: number; // μ - 3σ (conservative estimate)
}

// Convert 1-5 rating to TrueSkill μ value
export const ratingToMu = (rating: number): number => {
  // Map 1-5 to TrueSkill range 15-35
  // This gives room for improvement/decline while staying in reasonable bounds
  return (
    TRUESKILL_CONSTANTS.MIN_MU + (rating - TRUESKILL_CONSTANTS.MIN_RATING) * 5
  ); // 1→15, 2→20, 3→25, 4→30, 5→35
};

// Initialize TrueSkill with default parameters
const ts = new TrueSkill(
  TRUESKILL_CONSTANTS.DEFAULT_MU, // mu: Default rating
  TRUESKILL_CONSTANTS.DEFAULT_SIGMA, // sigma: Default uncertainty
  TRUESKILL_CONSTANTS.BETA, // beta: Skill distance for 76% win probability
  TRUESKILL_CONSTANTS.TAU, // tau: Dynamic factor
  TRUESKILL_CONSTANTS.DRAW_PROBABILITY, // drawProbability: 5% chance of draw
);

// Map to store player TrueSkill ratings
const playerRatings = new Map<string, PlayerTrueSkill>();

// Initialize a player with TrueSkill values, optionally seeded with initial rating
const initializePlayer = (
  playerId: string,
  playerName: string,
  initialRating?: number,
  isGuest: boolean = false,
): PlayerTrueSkill => {
  let mu: number;
  let sigma: number;

  if (initialRating !== undefined) {
    // Use the 1-5 rating to seed TrueSkill
    mu = ratingToMu(initialRating);
    // Guest players have 2x the uncertainty
    sigma = isGuest
      ? TRUESKILL_CONSTANTS.DEFAULT_SIGMA * 2
      : TRUESKILL_CONSTANTS.DEFAULT_SIGMA;
  } else {
    // Fall back to default TrueSkill values
    const rating = ts.createRating();
    mu = rating.mu;
    // Guest players have 2x the uncertainty
    sigma = isGuest ? rating.sigma * 2 : rating.sigma;
  }

  const playerSkill: PlayerTrueSkill = {
    playerId,
    playerName,
    mu,
    sigma,
    conservativeRating: mu - 3 * sigma,
  };

  playerRatings.set(playerId, playerSkill);
  return playerSkill;
};

// Get or create player TrueSkill rating
const getPlayerRating = (
  playerId: string,
  playerName: string,
  initialRating?: number,
  isGuest: boolean = false,
): PlayerTrueSkill => {
  if (!playerRatings.has(playerId)) {
    return initializePlayer(playerId, playerName, initialRating, isGuest);
  }
  return playerRatings.get(playerId)!;
};

// Convert match result to TrueSkill format
const convertMatchToTrueSkill = (match: MatchResult) => {
  const localTeam = match.localTeam.map((p) =>
    getPlayerRating(p._id, p.name, p.average, p.isGuest),
  );
  const awayTeam = match.awayTeam.map((p) =>
    getPlayerRating(p._id, p.name, p.average, p.isGuest),
  );

  // Convert to TrueSkill format using ts-trueskill Rating objects
  const localRatings = localTeam.map((p) => ts.createRating(p.mu, p.sigma));
  const awayRatings = awayTeam.map((p) => ts.createRating(p.mu, p.sigma));

  // Determine result based on match outcome

  // Calculate scores with proper operator precedence
  let localScore: number;
  let awayScore: number;

  if (match.localScore !== undefined && match.awayScore !== undefined) {
    // Use actual scores when available
    localScore = match.localScore;
    awayScore = match.awayScore;
  } else {
    // Use default scores based on result
    switch (match.result) {
      case "white":
        localScore = 1;
        awayScore = 0;
        break;
      case "dark":
        localScore = 0;
        awayScore = 1;
        break;
      case "draw":
        localScore = 1;
        awayScore = 1;
        break;
      default:
        throw new Error(`Unknown match result: ${match.result}`);
    }
  }

  const result = [localScore, awayScore];

  // For TrueSkill, we need to pass ranks to indicate the result
  // teams: [localRatings, awayRatings] - so local is index 0, away is index 1
  // ranks: [0, 0] for draw, [0, 1] for second team wins, [1, 0] for first team wins
  let ranks: number[];
  if (match.result === "draw") {
    ranks = [0, 0]; // Draw
  } else if (match.result === "white") {
    ranks = [0, 1]; // Local team (index 0) wins
  } else {
    ranks = [1, 0]; // Away team (index 1) wins
  }

  return {
    teams: [localRatings, awayRatings],
    result,
    ranks,
    localTeam,
    awayTeam,
  };
};

// Update player ratings after a match
const updatePlayerRatings = (
  localTeam: PlayerTrueSkill[],
  awayTeam: PlayerTrueSkill[],
  newLocalRatings: Rating[],
  newAwayRatings: Rating[],
  localPlayers: Player[],
  awayPlayers: Player[],
) => {
  // Update local team ratings (skip guest players)
  localTeam.forEach((player, index) => {
    const isGuest = localPlayers[index]?.isGuest || false;
    if (!isGuest) {
      const newRating = newLocalRatings[index];
      player.mu = newRating.mu;
      player.sigma = newRating.sigma;
      player.conservativeRating = newRating.mu - 3 * newRating.sigma;
      playerRatings.set(player.playerId, player);
    }
    // Guest players keep their original ratings unchanged
  });

  // Update away team ratings (skip guest players)
  awayTeam.forEach((player, index) => {
    const isGuest = awayPlayers[index]?.isGuest || false;
    if (!isGuest) {
      const newRating = newAwayRatings[index];
      player.mu = newRating.mu;
      player.sigma = newRating.sigma;
      player.conservativeRating = newRating.mu - 3 * newRating.sigma;
      playerRatings.set(player.playerId, player);
    }
    // Guest players keep their original ratings unchanged
  });
};

// Process all matches and calculate TrueSkill ratings
export const calculateTrueSkillRatings = (
  matches: MatchResult[],
): PlayerTrueSkill[] => {
  // Clear previous ratings
  playerRatings.clear();

  // Sort matches by date (oldest first) to process chronologically
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  sortedMatches.forEach((match) => {
    const matchData = convertMatchToTrueSkill(match);

    // Calculate new ratings using ranks from matchData
    const newRatings = ts.rate(matchData.teams, matchData.ranks);

    // Update player ratings
    updatePlayerRatings(
      matchData.localTeam,
      matchData.awayTeam,
      newRatings[0],
      newRatings[1],
      match.localTeam,
      match.awayTeam,
    );

    // Store snapshot of all players' TrueSkill stats at this point in time
    const snapshot: {
      [playerId: string]: {
        mu: number;
        sigma: number;
        conservativeRating: number;
        playerName: string;
      };
    } = {};
    playerRatings.forEach((playerTrueSkill) => {
      snapshot[playerTrueSkill.playerId] = {
        mu: playerTrueSkill.mu,
        sigma: playerTrueSkill.sigma,
        conservativeRating: playerTrueSkill.conservativeRating,
        playerName: playerTrueSkill.playerName,
      };
    });

    // Store the snapshot on the match (mutating the original match object)
    match.playerTSSnapshot = snapshot;
  });

  // Return all player ratings sorted by μ (highest first)
  return Array.from(playerRatings.values()).sort((a, b) => b.mu - a.mu);
};

// Helper function to get player TrueSkill data from a match snapshot
export const getPlayerTrueSkillFromSnapshot = (
  match: MatchResult,
  playerId: string,
): PlayerTrueSkill | null => {
  if (!match.playerTSSnapshot || !match.playerTSSnapshot[playerId]) {
    return null;
  }

  const snapshot = match.playerTSSnapshot[playerId];
  return {
    playerId,
    playerName: snapshot.playerName,
    mu: snapshot.mu,
    sigma: snapshot.sigma,
    conservativeRating: snapshot.conservativeRating,
  };
};

// Helper function to get all players' TrueSkill data from a match snapshot
export const getAllPlayerTrueSkillFromSnapshot = (
  match: MatchResult,
): Map<string, PlayerTrueSkill> => {
  const result = new Map<string, PlayerTrueSkill>();

  if (!match.playerTSSnapshot) {
    return result;
  }

  Object.entries(match.playerTSSnapshot).forEach(([playerId, snapshot]) => {
    result.set(playerId, {
      playerId,
      playerName: snapshot.playerName,
      mu: snapshot.mu,
      sigma: snapshot.sigma,
      conservativeRating: snapshot.conservativeRating,
    });
  });

  return result;
};

// Get current TrueSkill ratings for all players
export const getCurrentTrueSkillRatings = (): PlayerTrueSkill[] => {
  return Array.from(playerRatings.values()).sort((a, b) => b.mu - a.mu);
};

// Calculate TrueSkill ratings up to a specific match (not including the match)
export const calculateTrueSkillRatingsUpToMatch = (
  matches: MatchResult[],
  targetMatchId: string,
): Map<string, PlayerTrueSkill> => {
  // Clear ratings
  const tempRatings = new Map<string, PlayerTrueSkill>();

  // Sort matches by date (oldest first) to process chronologically
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Find the index of the target match
  const targetIndex = sortedMatches.findIndex(
    (match) => match._id === targetMatchId,
  );
  if (targetIndex === -1) {
    throw new Error(`Match with ID ${targetMatchId} not found`);
  }

  // Process only matches before the target match
  const matchesBeforeTarget = sortedMatches.slice(0, targetIndex);

  matchesBeforeTarget.forEach((match) => {
    // Get or initialize player ratings for this temporary calculation
    const getOrInitializeTempPlayer = (
      playerId: string,
      playerName: string,
      initialRating?: number,
      isGuest: boolean = false,
    ): PlayerTrueSkill => {
      if (!tempRatings.has(playerId)) {
        let mu: number;
        let sigma: number;

        if (initialRating !== undefined) {
          mu = ratingToMu(initialRating);
          // Guest players have 2x the uncertainty
          sigma = isGuest
            ? TRUESKILL_CONSTANTS.DEFAULT_SIGMA * 2
            : TRUESKILL_CONSTANTS.DEFAULT_SIGMA;
        } else {
          const rating = ts.createRating();
          mu = rating.mu;
          // Guest players have 2x the uncertainty
          sigma = isGuest ? rating.sigma * 2 : rating.sigma;
        }

        const playerSkill: PlayerTrueSkill = {
          playerId,
          playerName,
          mu,
          sigma,
          conservativeRating: mu - 3 * sigma,
        };

        tempRatings.set(playerId, playerSkill);
      }
      return tempRatings.get(playerId)!;
    };

    const localTeam = match.localTeam.map((p) =>
      getOrInitializeTempPlayer(p._id, p.name, p.average, p.isGuest),
    );
    const awayTeam = match.awayTeam.map((p) =>
      getOrInitializeTempPlayer(p._id, p.name, p.average, p.isGuest),
    );

    // Convert to TrueSkill format
    const localRatings = localTeam.map((p) => ts.createRating(p.mu, p.sigma));
    const awayRatings = awayTeam.map((p) => ts.createRating(p.mu, p.sigma));

    // Determine ranks
    let ranks: number[];
    if (match.result === "draw") {
      ranks = [0, 0];
    } else if (match.result === "white") {
      ranks = [0, 1];
    } else {
      ranks = [1, 0];
    }

    // Calculate new ratings
    const newRatings = ts.rate([localRatings, awayRatings], ranks);

    // Update temporary ratings (skip guest players)
    localTeam.forEach((player, index) => {
      const isGuest = match.localTeam[index]?.isGuest || false;
      if (!isGuest) {
        const newRating = newRatings[0][index];
        player.mu = newRating.mu;
        player.sigma = newRating.sigma;
        player.conservativeRating = newRating.mu - 3 * newRating.sigma;
        tempRatings.set(player.playerId, player);
      }
      // Guest players keep their original ratings unchanged
    });

    awayTeam.forEach((player, index) => {
      const isGuest = match.awayTeam[index]?.isGuest || false;
      if (!isGuest) {
        const newRating = newRatings[1][index];
        player.mu = newRating.mu;
        player.sigma = newRating.sigma;
        player.conservativeRating = newRating.mu - 3 * newRating.sigma;
        tempRatings.set(player.playerId, player);
      }
      // Guest players keep their original ratings unchanged
    });
  });

  return tempRatings;
};

// Calculate TrueSkill ratings including a specific match
export const calculateTrueSkillRatingsIncludingMatch = (
  matches: MatchResult[],
  targetMatchId: string,
): Map<string, PlayerTrueSkill> => {
  // Get ratings up to the match
  const ratingsBeforeMatch = calculateTrueSkillRatingsUpToMatch(
    matches,
    targetMatchId,
  );

  // Find the target match
  const targetMatch = matches.find((match) => match._id === targetMatchId);
  if (!targetMatch) {
    throw new Error(`Match with ID ${targetMatchId} not found`);
  }

  // Apply the target match to get after ratings
  const localTeam = targetMatch.localTeam.map((p) => {
    const existingRating = ratingsBeforeMatch.get(p._id);
    if (existingRating) {
      return existingRating;
    }

    // Initialize if not found
    const mu = ratingToMu(p.average || TRUESKILL_CONSTANTS.DEFAULT_MU / 5);
    const sigma = TRUESKILL_CONSTANTS.DEFAULT_SIGMA;
    const playerSkill: PlayerTrueSkill = {
      playerId: p._id,
      playerName: p.name,
      mu,
      sigma,
      conservativeRating: mu - 3 * sigma,
    };
    ratingsBeforeMatch.set(p._id, playerSkill);
    return playerSkill;
  });

  const awayTeam = targetMatch.awayTeam.map((p) => {
    const existingRating = ratingsBeforeMatch.get(p._id);
    if (existingRating) {
      return existingRating;
    }

    // Initialize if not found
    const mu = ratingToMu(p.average || TRUESKILL_CONSTANTS.DEFAULT_MU / 5);
    const sigma = TRUESKILL_CONSTANTS.DEFAULT_SIGMA;
    const playerSkill: PlayerTrueSkill = {
      playerId: p._id,
      playerName: p.name,
      mu,
      sigma,
      conservativeRating: mu - 3 * sigma,
    };
    ratingsBeforeMatch.set(p._id, playerSkill);
    return playerSkill;
  });

  // Convert to TrueSkill format
  const localRatings = localTeam.map((p) => ts.createRating(p.mu, p.sigma));
  const awayRatings = awayTeam.map((p) => ts.createRating(p.mu, p.sigma));

  // Determine ranks
  let ranks: number[];
  if (targetMatch.result === "draw") {
    ranks = [0, 0];
  } else if (targetMatch.result === "white") {
    ranks = [0, 1];
  } else {
    ranks = [1, 0];
  }

  // Calculate new ratings
  const newRatings = ts.rate([localRatings, awayRatings], ranks);

  // Update ratings with the match results
  const afterRatings = new Map(ratingsBeforeMatch);

  localTeam.forEach((player, index) => {
    const isGuest = targetMatch.localTeam[index]?.isGuest || false;
    if (!isGuest) {
      const newRating = newRatings[0][index];
      const updatedPlayer: PlayerTrueSkill = {
        ...player,
        mu: newRating.mu,
        sigma: newRating.sigma,
        conservativeRating: newRating.mu - 3 * newRating.sigma,
      };
      afterRatings.set(player.playerId, updatedPlayer);
    } else {
      // Guest players keep their original ratings unchanged
      afterRatings.set(player.playerId, player);
    }
  });

  awayTeam.forEach((player, index) => {
    const isGuest = targetMatch.awayTeam[index]?.isGuest || false;
    if (!isGuest) {
      const newRating = newRatings[1][index];
      const updatedPlayer: PlayerTrueSkill = {
        ...player,
        mu: newRating.mu,
        sigma: newRating.sigma,
        conservativeRating: newRating.mu - 3 * newRating.sigma,
      };
      afterRatings.set(player.playerId, updatedPlayer);
    } else {
      // Guest players keep their original ratings unchanged
      afterRatings.set(player.playerId, player);
    }
  });

  return afterRatings;
};

// Get TrueSkill rating for a specific player
export const getPlayerTrueSkill = (
  playerId: string,
): PlayerTrueSkill | undefined => {
  return playerRatings.get(playerId);
};

// Get TrueSkill μ value for a specific player, with fallback to default
export const getPlayerMu = (playerId: string): number => {
  const playerSkill = playerRatings.get(playerId);
  return playerSkill ? playerSkill.mu : TRUESKILL_CONSTANTS.DEFAULT_MU;
};

// Update players with their TrueSkill μ values
export const updatePlayersWithTrueSkill = (players: Player[]): Player[] => {
  return players.map((player) => {
    const playerTrueSkill = playerRatings.get(player._id);
    return {
      ...player,
      mu: getPlayerMu(player._id),
      sigma: playerTrueSkill?.sigma,
      conservativeRating: playerTrueSkill?.conservativeRating,
    };
  });
};

// Calculate enhanced average with TrueSkill bonus
export const calculateEnhancedAverage = (player: Player): number => {
  const baseAverage = player.average;
  const mu = player.mu || TRUESKILL_CONSTANTS.DEFAULT_MU;
  const muBonus =
    (mu - TRUESKILL_CONSTANTS.MU_BASELINE) /
    TRUESKILL_CONSTANTS.MU_BONUS_DIVISOR;
  return baseAverage + muBonus;
};
