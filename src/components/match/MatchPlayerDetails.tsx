import React, { useMemo } from "react";
import { Match, MatchResult } from "../../types/match";
import {
  PlayerTrueSkill,
  calculateTrueSkillRatingsUpToMatch,
  calculateTrueSkillRatingsIncludingMatch,
} from "../../trueskill-utils";
import { TeamTrueSkillDisplay } from "./TeamTrueSkillDisplay";

interface MatchPlayerDetailsProps {
  match: Match;
  allMatches: MatchResult[];
}

export const MatchPlayerDetails: React.FC<MatchPlayerDetailsProps> = ({
  match,
  allMatches,
}) => {
  const { beforeRatings, afterRatings } = useMemo(() => {
    try {
      const before = calculateTrueSkillRatingsUpToMatch(allMatches, match._id);
      const after = calculateTrueSkillRatingsIncludingMatch(
        allMatches,
        match._id,
      );

      return {
        beforeRatings: before,
        afterRatings: after,
      };
    } catch (error) {
      console.error("Error calculating TrueSkill ratings for match:", error);
      return {
        beforeRatings: new Map<string, PlayerTrueSkill>(),
        afterRatings: new Map<string, PlayerTrueSkill>(),
      };
    }
  }, [match._id, allMatches]);

  return (
    <div className="match-player-details">
      <h2>Jugadors</h2>

      <div className="teams-trueskill">
        <TeamTrueSkillDisplay
          team={match.localTeam}
          teamName="Equip ◻️"
          beforeRatings={beforeRatings}
          afterRatings={afterRatings}
        />

        <TeamTrueSkillDisplay
          team={match.awayTeam}
          teamName="Equip ◼️"
          beforeRatings={beforeRatings}
          afterRatings={afterRatings}
        />
      </div>
    </div>
  );
};
