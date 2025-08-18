import React from "react";
import { Player } from "../../data/players";
import "./TeamView.css";
import { TeamPlayer } from "./TeamPlayer";
import { TeamColor } from "../../types/match";

interface TeamProps {
  players: Player[];
  teamName: string;
  teamColor: TeamColor;
  onClickPlayer: (player: Player) => void;
  advantage: number;
}

export const TeamView: React.FC<TeamProps> = ({
  players,
  teamColor,
  teamName,
  onClickPlayer,
  advantage,
}) => {
  return (
    <div className="team">
      <h3>{teamName}</h3>
      <div className="team-players-grid">
        {players.map((player) => (
          <TeamPlayer
            key={player._id}
            player={player}
            teamColor={teamColor}
            onClick={onClickPlayer}
            advantage={advantage}
          />
        ))}
      </div>
    </div>
  );
};
