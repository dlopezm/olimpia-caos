import { Player } from "../data/players";

export interface PlayerMatchResult {
  matchedPlayers: Player[];
  unmatchedNames: string[];
  nicknameMatches: NicknameMatch[];
}

export interface NicknameMatch {
  name: string;
  player: Player;
  matchedBy: string;
}

/**
 * Parses a multi-line text input and extracts clean player names
 * Removes emojis, numbers, and special characters, keeping only letters and spaces
 */
export const parsePlayerList = (text: string): string[] => {
  return text
    .split("\n")
    .map((line) => {
      // Remove emojis, numbers, and special characters, keeping only letters and spaces
      return line.replace(/[^\p{L}\s]/gu, "").trim();
    })
    .filter((name) => name.length > 0);
};

/**
 * Matches player names against a database of players
 * First tries exact name matching, then falls back to nickname matching
 */
export const matchPlayersByName = (
  names: string[],
  players: Player[],
): PlayerMatchResult => {
  const matchedPlayers: Player[] = [];
  const unmatchedNames: string[] = [];
  const nicknameMatches: NicknameMatch[] = [];

  names.forEach((name) => {
    // Try exact name match first
    const exactMatch = players.find(
      (player) => player.name.toLowerCase() === name.toLowerCase(),
    );

    if (exactMatch) {
      matchedPlayers.push(exactMatch);
      return;
    }

    // Try nickname matching as fallback
    const nicknameMatch = players.find((player) =>
      player.nicknames?.some(
        (nickname) => nickname.toLowerCase() === name.toLowerCase(),
      ),
    );

    if (nicknameMatch) {
      const matchedNickname = nicknameMatch.nicknames?.find(
        (nickname) => nickname.toLowerCase() === name.toLowerCase(),
      );

      if (matchedNickname) {
        matchedPlayers.push(nicknameMatch);
        nicknameMatches.push({
          name,
          player: nicknameMatch,
          matchedBy: matchedNickname,
        });
      }
    } else {
      unmatchedNames.push(name);
    }
  });

  return {
    matchedPlayers,
    unmatchedNames,
    nicknameMatches,
  };
};

/**
 * Logs player matching results to console for debugging
 */
export const logMatchingResults = (result: PlayerMatchResult): void => {
  const { matchedPlayers, unmatchedNames, nicknameMatches } = result;

  console.log("=== PLAYER MATCHING RESULTS ===");
  console.log(
    `✅ Matched players (${matchedPlayers.length}):`,
    matchedPlayers.map((p) => p.name),
  );

  if (nicknameMatches.length > 0) {
    console.log("🏷️ Matched by nicknames:");
    nicknameMatches.forEach((match) => {
      console.log(
        `  "${match.name}" → ${match.player.name} (via nickname: "${match.matchedBy}")`,
      );
    });
  }

  console.log(
    `❌ Missing/Unmatched names (${unmatchedNames.length}):`,
    unmatchedNames,
  );

  if (unmatchedNames.length > 0) {
    console.warn(
      "⚠️ The following players were not found in the database:",
      unmatchedNames.join(", "),
    );
  }
};
