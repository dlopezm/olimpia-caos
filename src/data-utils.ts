import { TRUESKILL_CONSTANTS } from "./constants";

export const allPlayersQuery = (
  includeGuest: boolean,
) => `*[_type == "player" && ${includeGuest ? "true" : "!isGuest"}]{
          _id,
          name,
          nicknames,
          attack,
          defense,
          physical,
          vision,
          technique,
          isGuest,
          "average": (attack + defense + physical + vision + technique) / 5,
          "mu": ${TRUESKILL_CONSTANTS.DEFAULT_MU}, // Default μ value, will be updated by TrueSkill calculation
            avatar {
              hair,
              hairColor,
              facialHair,
              facialHairColor,
              skinColor,
              accessories,
              accessoriesColor
            }
        }`;

export const allMatchesQuery = `*[_type == "match"] | order(date desc){
  _id,
  date,
  result,
  localScore,
  awayScore,
  localTeam[]->{
    _id, name, nicknames, attack, defense, physical, vision, technique, isGuest,
    "average": (attack + defense + physical + vision + technique) / 5
  },
  awayTeam[]->{
    _id, name, nicknames, attack, defense, physical, vision, technique, isGuest,
    "average": (attack + defense + physical + vision + technique) / 5
  }
}`;
