import { Player } from "../../data/players";
import { TRUESKILL_CONSTANTS } from "../../constants";
import { calculateEnhancedAverage } from "../../trueskill-utils";
import { generatePlayerAvatar } from "../../utils/avatar-utils";
import "./TeamPlayer.css";

interface SelectedPlayerProps {
  player: Player;
  teamColor: "light" | "dark";
  onClick?: (player: Player) => void;
  advantage: number;
}

export const TeamPlayer = ({
  player,
  teamColor,
  onClick,
  advantage,
}: SelectedPlayerProps) => {
  console.log("teamColor", teamColor, "advantage", advantage);

  // Generate avatar using shared utility
  const svg = generatePlayerAvatar(player, 100, teamColor);

  return (
    <div
      className={`player-card ${teamColor === "light" ? "team-light" : "team-dark"}`}
      onClick={() => onClick?.(player)}
    >
      <div className="player-card-header">
        <div className="player-card-rating">
          <div className="enhanced-average">
            {calculateEnhancedAverage(player).toFixed(2)}
          </div>
        </div>
        <svg
          className="player-card-avatar"
          viewBox="0 0 100 100"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="player-card-name">{player.name}</div>
      </div>
      {!player.isGuest && (
        <div className="player-card-stats">
          <div>
            ATK <span>{player.attack.toFixed(2)}</span>
          </div>
          <div>
            DEF <span>{player.defense.toFixed(2)}</span>
          </div>
          <div>
            FIS <span>{player.physical.toFixed(2)}</span>
          </div>
          <div>
            VIS <span>{player.vision.toFixed(2)}</span>
          </div>
          <div>
            TEC <span>{player.technique.toFixed(2)}</span>
          </div>
          <div>
            TS{" "}
            <span>
              {(player.mu ?? TRUESKILL_CONSTANTS.DEFAULT_MU).toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
