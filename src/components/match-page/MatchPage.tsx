import { useParams } from "react-router-dom";
import { useData } from "../../stores/DataStore";
import { Match, MatchResult } from "../../types/match";
import { useMemo } from "react";
import { Player } from "../../data/players";
import { MatchCard, MatchPlayerDetails } from "../match";
import "./MatchPage.css";

export const MatchPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches: rawMatches, players, loading, error } = useData();

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

  const match = matches.find((m) => m._id === matchId);

  if (loading) {
    return <div className="loading">Carregant dades...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!match) {
    return <div className="error">Partit no trobat</div>;
  }

  const handleExplore = () => {
    // Do nothing - we're already on the match page
  };

  return (
    <div className="match-page">
      <div className="match-page-header">
        <h1>Detalls del partit</h1>
        <button className="back-button" onClick={() => window.history.back()}>
          ← Tornar
        </button>
      </div>

      <div className="match-content">
        <MatchCard match={match} onExplore={handleExplore} compact={false} />

        <MatchPlayerDetails match={match} allMatches={rawMatches} />
      </div>
    </div>
  );
};
