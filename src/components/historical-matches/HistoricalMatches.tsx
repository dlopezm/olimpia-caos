import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Player } from "../../data/players";
import "./HistoricalMatches.css";
import { Match, MatchResult } from "../../types/match";
import { useData } from "../../stores/DataStore";
import { MatchCard } from "../match";

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

  return (
    <div className="historical-matches">
      {matches.map((match) => (
        <MatchCard
          key={match._id}
          match={match}
          onExplore={handleExplore}
          compact={true}
        />
      ))}
    </div>
  );
};
