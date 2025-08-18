import { PlayerMatchStats } from "../match-stats-utils";

export interface Player {
  _id: string;
  name: string;
  attack: number;
  defense: number;
  physical: number;
  vision: number;
  technique: number;
  average: number;
  mu?: number; // TrueSkill μ value
  enhancedAverage?: number; // Pre-calculated enhanced average for performance
  winRate?: number; // Pre-calculated win rate for sorting
  currentStreak?: string; // Pre-calculated current streak for sorting
  matchStats?: PlayerMatchStats; // Win rate and last 5 matches
  isGuest: boolean;
  avatar?: {
    hair?: string;
    hairColor?: string;
    facialHair?: string;
    facialHairColor?: string;
    skinColor?: string;
    accessories?: string;
    accessoriesColor?: string;
  };
}
