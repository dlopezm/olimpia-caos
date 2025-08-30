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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    top: player.avatar?.hair ? [player.avatar.hair as any] : [],
    hairColor: player.avatar?.hairColor ? [player.avatar.hairColor] : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    facialHair: player.avatar?.facialHair
      ? [player.avatar.facialHair as any]
      : [],
    facialHairColor: player.avatar?.facialHairColor
      ? [player.avatar.facialHairColor]
      : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accessories: player.avatar?.accessories
      ? [player.avatar.accessories as any]
      : [],
    accessoriesColor: player.avatar?.accessoriesColor
      ? [player.avatar.accessoriesColor]
      : [],
    skinColor: player.avatar?.skinColor
      ? [player.avatar.skinColor]
      : ["c4c4c4"],
  });

  return avatar.toString();
};
