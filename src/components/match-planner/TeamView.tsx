import React from "react";
import { Player } from "../../data/players";
import "./TeamView.css";
import { TeamPlayer } from "./TeamPlayer";

interface TeamProps {
  players: Player[];
  teamName: string;
  teamColor: "light" | "dark";
  onClickPlayer: (player: Player) => void;
}

export const TeamView: React.FC<TeamProps> = ({
  players,
  teamColor,
  teamName,
  onClickPlayer,
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
          />
        ))}
      </div>
    </div>
  );
};
