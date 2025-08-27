import { Player } from "../data/players";
import { MatchResult } from "../types/match";

export interface PlayerPairStats {
  playerId: string;
  playerName: string;
  totalMatchesTogether: number;
  totalMatchesAgainst: number;
  togetherStats: {
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    drawRate: number;
    lossRate: number;
  };
  againstStats: {
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    drawRate: number;
    lossRate: number;
  };
}

export interface PlayerPairAnalysis {
  playerId: string;
  playerName: string;
  pairs: PlayerPairStats[];
}

export const calculatePlayerPairStats = (
  targetPlayerId: string,
  allPlayers: Player[],
  allMatches: MatchResult[]
): PlayerPairAnalysis => {
  const pairs: PlayerPairStats[] = [];
  
  // Get all other players
  const otherPlayers = allPlayers.filter(p => p._id !== targetPlayerId);
  
  for (const otherPlayer of otherPlayers) {
    const otherPlayerId = otherPlayer._id;
    
    // Find all matches where both players participated
    const matchesWithBothPlayers = allMatches.filter(match => {
      const targetInLocal = match.localTeam.some(p => p._id === targetPlayerId);
      const targetInAway = match.awayTeam.some(p => p._id === targetPlayerId);
      const otherInLocal = match.localTeam.some(p => p._id === otherPlayerId);
      const otherInAway = match.awayTeam.some(p => p._id === otherPlayerId);
      
      return (targetInLocal || targetInAway) && (otherInLocal || otherInAway);
    });
    
    // Only proceed if they have at least 4 matches together
    if (matchesWithBothPlayers.length < 4) {
      continue;
    }
    
    // Calculate statistics
    let togetherWins = 0;
    let togetherDraws = 0;
    let togetherLosses = 0;
    let againstWins = 0;
    let againstDraws = 0;
    let againstLosses = 0;
    
    for (const match of matchesWithBothPlayers) {
      const targetInLocal = match.localTeam.some(p => p._id === targetPlayerId);
      const targetInAway = match.awayTeam.some(p => p._id === targetPlayerId);
      const otherInLocal = match.localTeam.some(p => p._id === otherPlayerId);
      const otherInAway = match.awayTeam.some(p => p._id === otherPlayerId);
      
      // Determine if they played together or against each other
      const playedTogether = (targetInLocal && otherInLocal) || (targetInAway && otherInAway);
      const playedAgainst = (targetInLocal && otherInAway) || (targetInAway && otherInLocal);
      
      // Determine the result from target player's perspective
      let targetResult: 'win' | 'draw' | 'loss';
      
      if (match.result === 'draw') {
        targetResult = 'draw';
      } else if (
        (targetInLocal && match.result === 'white') ||
        (targetInAway && match.result === 'dark')
      ) {
        targetResult = 'win';
      } else {
        targetResult = 'loss';
      }
      
      // Update statistics
      if (playedTogether) {
        if (targetResult === 'win') togetherWins++;
        else if (targetResult === 'draw') togetherDraws++;
        else togetherLosses++;
      } else if (playedAgainst) {
        if (targetResult === 'win') againstWins++;
        else if (targetResult === 'draw') againstDraws++;
        else againstLosses++;
      }
    }
    
    const totalMatchesTogether = togetherWins + togetherDraws + togetherLosses;
    const totalMatchesAgainst = againstWins + againstDraws + againstLosses;
    
    // Calculate percentages
    const togetherStats = {
      wins: togetherWins,
      draws: togetherDraws,
      losses: togetherLosses,
      winRate: totalMatchesTogether > 0 ? (togetherWins / totalMatchesTogether) * 100 : 0,
      drawRate: totalMatchesTogether > 0 ? (togetherDraws / totalMatchesTogether) * 100 : 0,
      lossRate: totalMatchesTogether > 0 ? (togetherLosses / totalMatchesTogether) * 100 : 0,
    };
    
    const againstStats = {
      wins: againstWins,
      draws: againstDraws,
      losses: againstLosses,
      winRate: totalMatchesAgainst > 0 ? (againstWins / totalMatchesAgainst) * 100 : 0,
      drawRate: totalMatchesAgainst > 0 ? (againstDraws / totalMatchesAgainst) * 100 : 0,
      lossRate: totalMatchesAgainst > 0 ? (againstLosses / totalMatchesAgainst) * 100 : 0,
    };
    
    pairs.push({
      playerId: otherPlayerId,
      playerName: otherPlayer.name,
      totalMatchesTogether,
      totalMatchesAgainst,
      togetherStats,
      againstStats,
    });
  }
  
  // Sort pairs by total matches (together + against) in descending order
  pairs.sort((a, b) => {
    const totalA = a.totalMatchesTogether + a.totalMatchesAgainst;
    const totalB = b.totalMatchesTogether + b.totalMatchesAgainst;
    return totalB - totalA;
  });
  
  return {
    playerId: targetPlayerId,
    playerName: allPlayers.find(p => p._id === targetPlayerId)?.name || '',
    pairs,
  };
};
