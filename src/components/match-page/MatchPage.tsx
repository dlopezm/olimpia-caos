import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../stores/DataStore";
import { Match, MatchResult } from "../../types/match";
import { useMemo } from "react";
import { Player } from "../../data/players";
import { MatchCard, MatchPlayerDetails } from "../match";
import {
  PlayerTrueSkill,
  getAllPlayerTrueSkillFromSnapshot,
} from "../../trueskill-utils";
import "./MatchPage.css";

export const MatchPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
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

  const match = matches.find((m) => m._id === matchId);

  // Calculate TrueSkill ratings for this match
  const { beforeRatings } = useMemo(() => {
    if (!matchId) return { beforeRatings: new Map() };

    // Sort matches by date to find chronological order
    const sortedMatches = [...rawMatches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const currentMatchIndex = sortedMatches.findIndex((m) => m._id === matchId);
    if (currentMatchIndex === -1) {
      return { beforeRatings: new Map() };
    }

    // Before ratings: from previous match snapshot (if exists)
    let beforeRatings = new Map<string, PlayerTrueSkill>();
    if (currentMatchIndex > 0) {
      const previousMatch = sortedMatches[currentMatchIndex - 1];
      beforeRatings = getAllPlayerTrueSkillFromSnapshot(previousMatch);
    }

    return { beforeRatings };
  }, [matchId, rawMatches]);

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
    if (!match) return;

    // Extract player IDs and create short IDs (first 5 characters) for URL
    const localPlayerIds = match.localTeam.map((player) =>
      player._id.slice(0, 5),
    );
    const awayPlayerIds = match.awayTeam.map((player) =>
      player._id.slice(0, 5),
    );

    // Create URL parameters for the match planner
    const params = new URLSearchParams();
    if (localPlayerIds.length > 0)
      params.set("light", localPlayerIds.join(","));
    if (awayPlayerIds.length > 0) params.set("dark", awayPlayerIds.join(","));

    // Navigate to match planner with the players
    navigate(`/?${params.toString()}`);
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
        <MatchCard
          match={match}
          onExplore={handleExplore}
          compact={false}
          beforeRatings={beforeRatings}
        />

        <MatchPlayerDetails match={match} allMatches={rawMatches} />
      </div>
    </div>
  );
};
