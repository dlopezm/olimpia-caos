import React from "react";
import { Player } from "../../data/players";
import { generatePlayerAvatar } from "../../utils/avatar-utils";

interface PlayerAvatarProps {
  player: Player;
  size?: number;
  teamColor?: "light" | "dark";
  className?: string;
  onClick?: () => void;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 100,
  teamColor,
  className = "",
  onClick,
}) => {
  const svg = generatePlayerAvatar(player, size, teamColor);

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
