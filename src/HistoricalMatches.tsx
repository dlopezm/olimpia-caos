import { useEffect, useState } from "react";
import { sanityClient } from "./sanity-client";
import { TeamSummary } from "./TeamSummary";
import './HistoricalMatches.css';

interface Player {
  _id: string;
  name: string;
  attack: number;
  defense: number;
  physical: number;
  vision: number;
  technique: number;
}

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
          _id,
          name,
          attack,
          defense,
          physical,
          vision,
          technique
        },
        awayTeam[]->{
          _id,
          name,
          attack,
          defense,
          physical,
          vision,
          technique
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
      {matches.map((match) => (
        <div key={match._id} className="match-card">
          <div className="match-header">
            <strong>{new Date(match.date).toLocaleDateString()}</strong> – {resultToTitle(match.result)}
          </div>
          <TeamSummary players={match.localTeam} label="◻️" />
          <TeamSummary players={match.awayTeam} label="◼️" />
        </div>
      ))}
    </div>
  );
};
