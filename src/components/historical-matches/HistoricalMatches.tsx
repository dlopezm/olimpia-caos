import { useState, useEffect } from "react";
import { FaMagnifyingGlassChart } from "react-icons/fa6";

import { Player } from "../../data/players";
import { calculateTeamDifference } from "../../generate-teams";
import { sanityClient } from "../../sanity-client";
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
      const query = `*[_type == "match"] | order(date desc){
        _id,
        date,
        result,
        localScore,
        awayScore,
        localTeam[]->{
          _id, name, attack, defense, physical, vision, technique,
          "average": (attack + defense + physical + vision + technique) / 5
        },
        awayTeam[]->{
          _id, name, attack, defense, physical, vision, technique,
          "average": (attack + defense + physical + vision + technique) / 5
        }
      }`;
      const data = await sanityClient.fetch(query);
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
            <div className="match-header">
              <div className="match-header-left">
                <span className="match-date">
                  {new Date(match.date).toLocaleDateString()}
                </span>
                <span className="match-score">
                  {match.localScore ?? "-"} : {match.awayScore ?? "-"}
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
              <span className={`match-result-badge ${match.result}`}>
                {resultToTitle(match.result)}
              </span>
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
