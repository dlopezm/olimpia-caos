import { Player } from "../../data/players";
import "./TeamPlayer.css";

interface SelectedPlayerProps {
  player: Player;
  teamColor: "light" | "dark";
  onClick?: (player: Player) => void;
}

export const TeamPlayer = ({
  player,
  teamColor,
  onClick,
}: SelectedPlayerProps) => {
  return (
    <div
      className={`player-card ${teamColor === "light" ? "team-light" : "team-dark"}`}
      onClick={() => onClick?.(player)}
    >
      <div className="player-card-header">
        <div className="player-card-rating">{player.average}</div>
        <div className="player-card-name">{player.name}</div>
      </div>
      <div className="player-card-stats">
        <div>
          ATK <span>{player.attack}</span>
        </div>
        <div>
          DEF <span>{player.defense}</span>
        </div>
        <div>
          FIS <span>{player.physical}</span>
        </div>
        <div>
          VIS <span>{player.vision}</span>
        </div>
        <div>
          TEC <span>{player.technique}</span>
        </div>
      </div>
    </div>
  );
};
