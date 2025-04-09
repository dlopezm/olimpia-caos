export const allPlayersQuery = (
  includeGuest: boolean,
) => `*[_type == "player" && ${includeGuest ? "true" : "!isGuest"}]{
          _id,
          name,
          attack,
          defense,
          physical,
          vision,
          technique,
          isGuest,
          "average": (attack + defense + physical + vision + technique) / 5
        }`;
