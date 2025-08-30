import React, { useMemo } from "react";
import { Match, MatchResult } from "../../types/match";
import {
  PlayerTrueSkill,
  getAllPlayerTrueSkillFromSnapshot,
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
      // Sort matches by date to find the chronological order
      const sortedMatches = [...allMatches].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Find current match index
      const currentMatchIndex = sortedMatches.findIndex(m => m._id === match._id);
      if (currentMatchIndex === -1) {
        throw new Error(`Match with ID ${match._id} not found`);
      }

      // For "before" ratings: get snapshot from the previous match (if exists)
      let beforeRatings = new Map<string, PlayerTrueSkill>();
      if (currentMatchIndex > 0) {
        const previousMatch = sortedMatches[currentMatchIndex - 1];
        beforeRatings = getAllPlayerTrueSkillFromSnapshot(previousMatch);
      }
      // If no previous match, beforeRatings remains empty (initial state)

      // For "after" ratings: get snapshot from the current match
      const currentMatchResult = allMatches.find(m => m._id === match._id);
      const afterRatings = currentMatchResult 
        ? getAllPlayerTrueSkillFromSnapshot(currentMatchResult)
        : new Map<string, PlayerTrueSkill>();

      return {
        beforeRatings,
        afterRatings,
      };
    } catch (error) {
      console.error("Error getting TrueSkill ratings from snapshots:", error);
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
