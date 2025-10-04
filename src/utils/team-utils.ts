import { Player } from "../data/players";
import { calculateEnhancedAverage } from "../trueskill-utils";

export const formatTeamNames = (team: Player[]): string => {
  return team.map((p) => p.name).join(", ");
};

// Formats team for sharing/copying (matches MatchPlanner format)
export const formatTeamForSharing = (
  players: Player[],
  symbol: string,
): string => {
  const average =
    players.reduce((acc, p) => acc + calculateEnhancedAverage(p), 0) /
    players.length;
  const trueSkillAvg = calculateTeamTrueSkillAverage(players);
  return [
    `Equip ${symbol}: ${average.toFixed(2)} TS:${trueSkillAvg.toFixed(1)}`,
    ...players.map((p) => ` ${symbol} ${p.name}`),
  ].join("\n");
};

export const calculateTeamEnhancedAverage = (team: Player[]): number => {
  return (
    team.reduce((acc, p) => acc + calculateEnhancedAverage(p), 0) / team.length
  );
};

export const calculateTeamTrueSkillAverage = (team: Player[]): number => {
  return team.reduce((acc, p) => acc + (p.mu || 25), 0) / team.length;
};

// Creates gradient from green (0) to red (maxThreshold)
export const getGradientColor = (
  value: number,
  maxThreshold: number,
): string => {
  const ratio = Math.min(value / maxThreshold, 1);
  const red = Math.round(255 * ratio);
  const green = Math.round(255 * (1 - ratio));
  return `rgb(${red}, ${green}, 0)`;
};
