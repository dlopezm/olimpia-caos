import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { Player } from "../data/players";

export const generatePlayerAvatar = (
  player: Player,
  size: number = 100,
  teamColor?: "light" | "dark",
) => {
  const avatar = createAvatar(avataaars, {
    seed: player.name,
    size,
    radius: size / 2,
    flip: teamColor === "dark",
    facialHairProbability: 100,
    accessoriesProbability: 100,
    eyes: ["default"],
    eyebrows: ["default"],
    clothing: ["shirtVNeck"],
    clothesColor: [
      teamColor === "light"
        ? "FFFFFF"
        : teamColor === "dark"
          ? "000000"
          : "FFFFFF",
    ],
    mouth: ["serious"],
    top: player.avatar?.hair ? [player.avatar.hair] : [],
    hairColor: player.avatar?.hairColor ? [player.avatar.hairColor] : [],
    facialHair: player.avatar?.facialHair ? [player.avatar.facialHair] : [],
    facialHairColor: player.avatar?.facialHairColor
      ? [player.avatar.facialHairColor]
      : [],
    accessories: player.avatar?.accessories ? [player.avatar.accessories] : [],
    accessoriesColor: player.avatar?.accessoriesColor
      ? [player.avatar.accessoriesColor]
      : [],
    skinColor: player.avatar?.skinColor
      ? [player.avatar.skinColor]
      : ["c4c4c4"],
  });

  return avatar.toString();
};
