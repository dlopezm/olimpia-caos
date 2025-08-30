import React from "react";
import { Player } from "../../data/players";
import { PlayerTrueSkill } from "../../trueskill-utils";
import { PlayerTrueSkillDisplay } from "./PlayerTrueSkillDisplay";

interface TeamTrueSkillDisplayProps {
  team: Player[];
  teamName: string;
  beforeRatings?: Map<string, PlayerTrueSkill>;
  afterRatings?: Map<string, PlayerTrueSkill>;
}

export const TeamTrueSkillDisplay: React.FC<TeamTrueSkillDisplayProps> = ({
  team,
  teamName,
  beforeRatings,
  afterRatings,
}) => {
  return (
    <div className="team-trueskill-display">
      <h3 className="team-header">{teamName}</h3>

      <div className="players-list">
        {team.map((player) => (
          <PlayerTrueSkillDisplay
            key={player._id}
            player={player}
            beforeRating={beforeRatings?.get(player._id)}
            afterRating={afterRatings?.get(player._id)}
          />
        ))}
      </div>
    </div>
  );
};
