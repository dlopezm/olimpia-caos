import { useMemo } from "react";
import { FaMagnifyingGlassChart } from "react-icons/fa6";

import { Player } from "../../data/players";
import { calculateTeamDifference } from "../../generate-teams";
import "./HistoricalMatches.css";
import { TeamComparison } from "../shared/TeamComparison";
import { Match, MatchResult } from "../../types/match";
import { useData } from "../../stores/DataStore";

const resultToTitle = (result: string) => {
  switch (result) {
    case "white":
      return "Victòria ◻️";
    case "dark":
      return "Victòria ◼️";
    case "draw":
      return "Empat";
    default:
      return "";
  }
};

export const HistoricalMatches = () => {
  const { matches: rawMatches, players, loading, error } = useData();

  // Convert MatchResult to Match by finding full player objects
  const matches: Match[] = useMemo(() => {
    if (rawMatches.length === 0 || players.length === 0) return [];

    return rawMatches.map((match: MatchResult) => {
      const findPlayer = (playerId: string) =>
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

  const shortId = (id: string) => id.slice(0, 5);

  const handleLoadMatch = (light: Player[], dark: Player[]) => {
    const lightIds = light.map((p) => shortId(p._id)).join(",");
    const darkIds = dark.map((p) => shortId(p._id)).join(",");
    const base = window.location.pathname.replace(/[^/]+$/, "");
    window.location.href = `${base}?light=${lightIds}&dark=${darkIds}#equipador`;
  };

  if (loading) {
    return <div>Carregant dades...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="historical-matches">
      {matches.map((match) => {
        const diff = calculateTeamDifference(match.localTeam, match.awayTeam);

        return (
          <div key={match._id} className="match-card" data-match-id={match._id}>
            {/* --- Header with badge on left, date & button top row, centered score below --- */}
            <div className="match-header-wrapper">
              <div className="match-header">
                <span className={`match-result-badge ${match.result}`}>
                  {resultToTitle(match.result)}
                </span>

                <div className="match-info-block">
                  <div className="top-row">
                    <span className="match-date">
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                    <button
                      className="load-match-button"
                      onClick={() =>
                        handleLoadMatch(match.localTeam, match.awayTeam)
                      }
                    >
                      Explora <FaMagnifyingGlassChart />
                    </button>
                  </div>

                  {match.localScore != null && match.awayScore != null && (
                    <div className="match-score">
                      {match.localScore}
                      <span className="colon">:</span>
                      {match.awayScore}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="match-diff">
              {Math.abs(diff).toFixed(2) === "0.00" ? (
                "Igualtat màxima"
              ) : (
                <>
                  Diferència de {Math.abs(diff).toFixed(2)} punts de crack a
                  favor de {diff > 0 ? "◻️" : "◼️"}
                </>
              )}
            </div>

            <div className="match-teams">
              <TeamComparison
                team1={match.localTeam}
                team2={match.awayTeam}
                compact
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
