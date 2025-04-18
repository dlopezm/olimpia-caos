import { Player } from "../../data/players";
import "./TeamPlayer.css";

import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';




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

  const avatar = createAvatar(avataaars, {
    seed: player.name,
    size: 100,
    radius: 50,
    flip: teamColor === "dark",
    facialHairProbability: 100,
    accessoriesProbability: 100,
    eyes: ["default"],
    eyebrows: ["default"],
    clothing: ["shirtVNeck"],
    clothesColor: [teamColor === "light" ? "FFFFFF" : "000000"],
    mouth: player.avatar ? ["twinkle"] : ["serious"],

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    top: player.avatar?.hair ? [player.avatar.hair as any] : [],
    hairColor: player.avatar?.hairColor ? [player.avatar.hairColor] : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    facialHair: player.avatar?.facialHair ? [player.avatar.facialHair as any] : [],
    facialHairColor: player.avatar?.facialHairColor ? [player.avatar.facialHairColor] : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accessories: player.avatar?.accessories ? [player.avatar.accessories as any] : [],
    accessoriesColor: player.avatar?.accessoriesColor ? [player.avatar.accessoriesColor] : [],
    skinColor: player.avatar?.skinColor ? [player.avatar.skinColor] : ['c4c4c4'], // default grey

  });


  const svg = avatar.toString();


  return (
    <div
      className={`player-card ${teamColor === "light" ? "team-light" : "team-dark"}`}
      onClick={() => onClick?.(player)}
    >
      <div className="player-card-header">
        <div className="player-card-rating">{player.average.toFixed(2)}</div>
        <svg className="player-card-avatar" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: svg }} />
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
        </div>
      )}
    </div>
  );
};
