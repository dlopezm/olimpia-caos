import { useState, useEffect } from "react";
import { Player } from "../../data/players";
import { calculateTeamDifference } from "../../generate-teams";
import { sanityClient } from "../../sanity-client";
import { TeamSummary } from "./TeamSummary";
import "./HistoricalMatches.css";

interface Match {
  _id: string;
  date: string;
  result: "white" | "dark" | "draw";
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

  return (
    <div className="historical-matches">
      <h3>Historial de Partits</h3>
      {matches.map((match) => {
        const diff = calculateTeamDifference(match.localTeam, match.awayTeam);

        return (
          <div key={match._id} className="match-card">
            <div className="match-header">
              <span className="match-date">
                {new Date(match.date).toLocaleDateString()}
              </span>
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
              <div className="team-column light-team">
                <TeamSummary players={match.localTeam} label="◻️" />
              </div>

              <div className="team-column dark-team">
                <TeamSummary players={match.awayTeam} label="◼️" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
