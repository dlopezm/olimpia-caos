import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Player } from "../../data/players";
import "./HistoricalMatches.css";
import { Match, MatchResult } from "../../types/match";
import { useData } from "../../stores/DataStore";
import { MatchCard } from "../match";
import {
  PlayerTrueSkill,
  getAllPlayerTrueSkillFromSnapshot,
} from "../../trueskill-utils";

export const HistoricalMatches = () => {
  const { matches: rawMatches, players, loading, error } = useData();
  const navigate = useNavigate();

  // Convert MatchResult to Match by finding full player objects
  const matches: Match[] = useMemo(() => {
    if (rawMatches.length === 0 || players.length === 0) return [];

    return rawMatches.map((match: MatchResult) => {
      const findPlayer = (playerId: string): Player =>
        players.find((p) => p._id === playerId) || {
          _id: playerId,
          name: "Unknown Player",
          attack: 0,
          defense: 0,
          physical: 0,
          vision: 0,
          technique: 0,
          average: 0,
          isGuest: false,
        };

      return {
        ...match,
        localTeam: match.localTeam.map((p) => findPlayer(p._id)),
        awayTeam: match.awayTeam.map((p) => findPlayer(p._id)),
      };
    });
  }, [rawMatches, players]);

  if (loading) {
    return <div>Carregant dades...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleExplore = (match: Match) => {
    navigate(`/partit/${match._id}`);
  };

  // Helper function to get TrueSkill ratings for a specific match
  const getTrueSkillRatingsForMatch = (
    matchId: string,
  ): { before: Map<string, PlayerTrueSkill> } => {
    // Sort matches by date to find chronological order
    const sortedMatches = [...rawMatches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const currentMatchIndex = sortedMatches.findIndex((m) => m._id === matchId);
    if (currentMatchIndex === -1) {
      return { before: new Map() };
    }

    // Before ratings: from previous match snapshot (if exists)
    let beforeRatings = new Map<string, PlayerTrueSkill>();
    if (currentMatchIndex > 0) {
      const previousMatch = sortedMatches[currentMatchIndex - 1];
      beforeRatings = getAllPlayerTrueSkillFromSnapshot(previousMatch);
    }

    return { before: beforeRatings };
  };

  return (
    <div className="historical-matches">
      {matches.map((match) => {
        const { before } = getTrueSkillRatingsForMatch(match._id);

        return (
          <MatchCard
            key={match._id}
            match={match}
            onExplore={handleExplore}
            compact={true}
            beforeRatings={before}
          />
        );
      })}
    </div>
  );
};
