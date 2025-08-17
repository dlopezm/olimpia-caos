import { TrueSkill } from 'ts-trueskill';
import { Player } from './data/players';
import { TRUESKILL_CONSTANTS } from './constants';
export interface PlayerTrueSkill {
  playerId: string;
  playerName: string;
  mu: number; // TrueSkill rating (μ)
  sigma: number; // TrueSkill uncertainty (σ)
  conservativeRating: number; // μ - 3σ (conservative estimate)
}

export interface MatchResult {
  _id: string;
  date: string;
  result: "white" | "dark" | "draw";
  localScore?: number;
  awayScore?: number;
  localTeam: { _id: string; name: string; average?: number }[];
  awayTeam: { _id: string; name: string; average?: number }[];
}

// Convert 1-5 rating to TrueSkill μ value
export const ratingToMu = (rating: number): number => {
  // Map 1-5 to TrueSkill range 15-35
  // This gives room for improvement/decline while staying in reasonable bounds
  return TRUESKILL_CONSTANTS.MIN_MU + (rating - TRUESKILL_CONSTANTS.MIN_RATING) * 5; // 1→15, 2→20, 3→25, 4→30, 5→35
};


// Initialize TrueSkill with default parameters
const ts = new TrueSkill(
  TRUESKILL_CONSTANTS.DEFAULT_MU, // mu: Default rating
  TRUESKILL_CONSTANTS.DEFAULT_SIGMA, // sigma: Default uncertainty
  TRUESKILL_CONSTANTS.BETA, // beta: Skill distance for 76% win probability
  TRUESKILL_CONSTANTS.TAU, // tau: Dynamic factor
  TRUESKILL_CONSTANTS.DRAW_PROBABILITY // drawProbability: 5% chance of draw
);

// Map to store player TrueSkill ratings
const playerRatings = new Map<string, PlayerTrueSkill>();

// Initialize a player with TrueSkill values, optionally seeded with initial rating
const initializePlayer = (playerId: string, playerName: string, initialRating?: number): PlayerTrueSkill => {
  let mu: number;
  let sigma: number;
  
  if (initialRating !== undefined) {
    // Use the 1-5 rating to seed TrueSkill
    mu = ratingToMu(initialRating);
    sigma = TRUESKILL_CONSTANTS.DEFAULT_SIGMA;
  } else {
    // Fall back to default TrueSkill values
    const rating = ts.createRating();
    mu = rating.mu;
    sigma = rating.sigma;
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
const getPlayerRating = (playerId: string, playerName: string, initialRating?: number): PlayerTrueSkill => {
  if (!playerRatings.has(playerId)) {
    return initializePlayer(playerId, playerName, initialRating);
  }
  return playerRatings.get(playerId)!;
};

// Convert match result to TrueSkill format
const convertMatchToTrueSkill = (match: MatchResult) => {
  const localTeam = match.localTeam.map(p => getPlayerRating(p._id, p.name, p.average));
  const awayTeam = match.awayTeam.map(p => getPlayerRating(p._id, p.name, p.average));

  // Convert to TrueSkill format using ts-trueskill Rating objects
  const localRatings = localTeam.map(p => ts.createRating(p.mu, p.sigma));
  const awayRatings = awayTeam.map(p => ts.createRating(p.mu, p.sigma));

  // Determine result based on match outcome
  let result: number[];
  
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

  result = [localScore, awayScore];

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
  newLocalRatings: any[],
  newAwayRatings: any[]
) => {
  // Update local team ratings
  localTeam.forEach((player, index) => {
    const newRating = newLocalRatings[index];
    player.mu = newRating.mu;
    player.sigma = newRating.sigma;
    player.conservativeRating = newRating.mu - 3 * newRating.sigma;
    playerRatings.set(player.playerId, player);
  });

  // Update away team ratings
  awayTeam.forEach((player, index) => {
    const newRating = newAwayRatings[index];
    player.mu = newRating.mu;
    player.sigma = newRating.sigma;
    player.conservativeRating = newRating.mu - 3 * newRating.sigma;
    playerRatings.set(player.playerId, player);
  });
};

// Process all matches and calculate TrueSkill ratings
export const calculateTrueSkillRatings = (matches: MatchResult[]): PlayerTrueSkill[] => {
  // Clear previous ratings
  playerRatings.clear();

  // Sort matches by date (oldest first) to process chronologically
  const sortedMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedMatches.forEach((match) => {
    const matchData = convertMatchToTrueSkill(match);

    // Calculate new ratings using ranks from matchData
    const newRatings = ts.rate(matchData.teams, matchData.ranks);

    // Update player ratings
    updatePlayerRatings(
      matchData.localTeam,
      matchData.awayTeam,
      newRatings[0],
      newRatings[1]
    );
  });

  // Return all player ratings sorted by μ (highest first)
  return Array.from(playerRatings.values()).sort((a, b) => b.mu - a.mu);
};

// Get current TrueSkill ratings for all players
export const getCurrentTrueSkillRatings = (): PlayerTrueSkill[] => {
  return Array.from(playerRatings.values()).sort((a, b) => b.mu - a.mu);
};

// Get TrueSkill rating for a specific player
export const getPlayerTrueSkill = (playerId: string): PlayerTrueSkill | undefined => {
  return playerRatings.get(playerId);
};

// Get TrueSkill μ value for a specific player, with fallback to default
export const getPlayerMu = (playerId: string): number => {
  const playerSkill = playerRatings.get(playerId);
  return playerSkill ? playerSkill.mu : TRUESKILL_CONSTANTS.DEFAULT_MU;
};

// Update players with their TrueSkill μ values
export const updatePlayersWithTrueSkill = (players: Player[]): Player[] => {
  return players.map(player => ({
    ...player,
    mu: getPlayerMu(player._id)
  }));
};

// Calculate enhanced average with TrueSkill bonus
export const calculateEnhancedAverage = (player: Player): number => {
  const baseAverage = player.average;
  const mu = player.mu || TRUESKILL_CONSTANTS.DEFAULT_MU;
  const muBonus = (mu - TRUESKILL_CONSTANTS.MU_BASELINE) / TRUESKILL_CONSTANTS.MU_BONUS_DIVISOR;
  return baseAverage + muBonus;
};
