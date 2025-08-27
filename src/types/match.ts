import { Player } from "../data/players";

export interface MatchResult {
  _id: string;
  date: string;
  result: "white" | "dark" | "draw";
  localScore?: number;
  awayScore?: number;
  localTeam: { _id: string; name: string; average?: number }[];
  awayTeam: { _id: string; name: string; average?: number }[];
}

// Alias for when we need the full Player objects
export type Match = Omit<MatchResult, "localTeam" | "awayTeam"> & {
  localTeam: Player[];
  awayTeam: Player[];
};

// Team color type used across components
export type TeamColor = "light" | "dark";

// Compact outcome for per-player streaks and summaries
export type MatchOutcomeLetter = "W" | "D" | "L";
