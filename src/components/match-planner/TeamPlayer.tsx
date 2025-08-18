import { Player } from "../../data/players";
import "./TeamPlayer.css";
import { calculateEnhancedAverage } from "../../trueskill-utils";
import { TRUESKILL_CONSTANTS } from "../../constants";
import { TeamColor } from "../../types/match";

import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

interface SelectedPlayerProps {
  player: Player;
  teamColor: TeamColor;
  onClick?: (player: Player) => void;
  advantage: number;
}

const MOUTH_BY_ADVANTAGE = {
  1.5: "smile",
  0.8: "twinkle",
  0.4: "default",
  [-0.4]: "serious",
  [-0.8]: "sad",
  [-1.5]: "concerned",
  [-10000]: "screamOpen",
} as const;

const EYES_BY_ADVANTAGE = {
  1.5: "happy",
  0.8: "closed",
  0.4: "surprised",
  [-0.4]: "default",
  [-0.8]: "eyeRoll",
  [-1.5]: "cry",
  [-10000]: "xDizzy",
} as const;

export const TeamPlayer = ({
  player,
  teamColor,
  onClick,
  advantage,
}: SelectedPlayerProps) => {
  console.log("teamColor", teamColor, "advantage", advantage);
  const mouth =
    Object.entries(MOUTH_BY_ADVANTAGE).find(([key]) => {
      const value = Number(key);
      return advantage >= value;
    })?.[1] || "serious";

  const eyes =
    Object.entries(EYES_BY_ADVANTAGE).find(([key]) => {
      const value = Number(key);
      return advantage >= value;
    })?.[1] || "default";

  const avatar = createAvatar(avataaars, {
    seed: player.name,
    size: 100,
    radius: 50,
    flip: teamColor === "dark",
    facialHairProbability: 100,
    accessoriesProbability: 100,
    eyes: [eyes],
    eyebrows: ["default"],
    clothing: ["shirtVNeck"],
    clothesColor: [teamColor === "light" ? "FFFFFF" : "000000"],

    mouth: [mouth],

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    top: player.avatar?.hair ? [player.avatar.hair as any] : [],
    hairColor: player.avatar?.hairColor ? [player.avatar.hairColor] : [],
    facialHair: player.avatar?.facialHair
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [player.avatar.facialHair as any]
      : [],
    facialHairColor: player.avatar?.facialHairColor
      ? [player.avatar.facialHairColor]
      : [],
    accessories: player.avatar?.accessories
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [player.avatar.accessories as any]
      : [],
    accessoriesColor: player.avatar?.accessoriesColor
      ? [player.avatar.accessoriesColor]
      : [],
    skinColor: player.avatar?.skinColor
      ? [player.avatar.skinColor]
      : ["c4c4c4"], // default grey
  });

  const svg = avatar.toString();

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
