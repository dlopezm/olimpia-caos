import React from "react";
import { Match } from "../../types/match";
import "./match.css";
import { calculateTeamDifference } from "../../generate-teams";
import { MatchHeader } from "./MatchHeader";
import { TeamComparison } from "../shared/TeamComparison";
import { PlayerTrueSkill } from "../../trueskill-utils";

interface MatchCardProps {
  match: Match;
  onExplore: (match: Match) => void;
  compact?: boolean;
  beforeRatings?: Map<string, PlayerTrueSkill>;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onExplore,
  compact = true,
  beforeRatings,
}) => {
  const difference = calculateTeamDifference(match.localTeam, match.awayTeam);

  return (
    <div className="match-card" data-match-id={match._id}>
      <MatchHeader
        result={match.result}
        date={match.date}
        localScore={match.localScore}
        awayScore={match.awayScore}
        matchId={match._id}
        onExplore={() => onExplore(match)}
      />

      <div className="match-diff">
        {Math.abs(difference).toFixed(2) === "0.00" ? (
          "Igualtat màxima"
        ) : (
          <>
            Diferència de {Math.abs(difference).toFixed(2)} punts de crack a
            favor de {difference > 0 ? "◻️" : "◼️"}
          </>
        )}
      </div>

      <div className="match-teams">
        <TeamComparison
          team1={match.localTeam}
          team2={match.awayTeam}
          compact={compact}
          beforeRatings={beforeRatings}
        />
      </div>
    </div>
  );
};
