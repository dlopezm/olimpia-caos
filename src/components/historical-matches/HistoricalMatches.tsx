import { useState, useEffect } from "react";
import { FaMagnifyingGlassChart } from "react-icons/fa6";

import { Player } from "../../data/players";
import { calculateTeamDifference } from "../../generate-teams";
import { sanityClient } from "../../sanity-client";
import { allMatchesQuery } from "../../data-utils";

import "./HistoricalMatches.css";
import { TeamComparison } from "../shared/TeamComparison";

interface Match {
  _id: string;
  date: string;
  result: "white" | "dark" | "draw";
  localScore?: number;
  awayScore?: number;
  localTeam: Player[];
  awayTeam: Player[];
}

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
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const data = await sanityClient.fetch(allMatchesQuery);
      setMatches(data);
    };
    fetchMatches();
  }, []);

  const shortId = (id: string) => id.slice(0, 5);

  const handleLoadMatch = (light: Player[], dark: Player[]) => {
    const lightIds = light.map((p) => shortId(p._id)).join(",");
    const darkIds = dark.map((p) => shortId(p._id)).join(",");
    const base = window.location.pathname.replace(/[^/]+$/, "");
    window.location.href = `${base}?light=${lightIds}&dark=${darkIds}#equipador`;
  };

  return (
    <div className="historical-matches">
      {matches.map((match) => {
        const diff = calculateTeamDifference(match.localTeam, match.awayTeam);

        return (
          <div key={match._id} className="match-card">
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
