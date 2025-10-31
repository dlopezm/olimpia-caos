// TrueSkill Configuration Constants
export const TRUESKILL_CONSTANTS = {
  // Default TrueSkill values
  DEFAULT_MU: 25.0,
  DEFAULT_SIGMA: 8.3,

  // TrueSkill parameters
  BETA: 4.166, // Skill distance for 76% win probability
  TAU: 0.12, // Dynamic factor
  DRAW_PROBABILITY: 0.05, // 5% chance of draw

  // Rating conversion constants
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_MU: 15, // Minimum μ value from 1-5 rating conversion
  MAX_MU: 35, // Maximum μ value from 1-5 rating conversion

  // Enhanced average calculation
  MU_BONUS_DIVISOR: 10, // Divisor for (μ-25)/10 calculation
  MU_BASELINE: 20.0, // Baseline μ value for bonus calculation
} as const;

// CSS Class Names
export const CSS_CLASSES = {
  PLAYER_CARD_RATING: "player-card-rating",
  ENHANCED_AVERAGE: "enhanced-average",
  MU_VALUE: "mu-value",
} as const;
