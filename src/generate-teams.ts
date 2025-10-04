import { Player } from "./data/players";

const ITERATIONS = 50; // Number of iterations for the swap optimization

const calculateTotalsPerStat = (
  team: Player[],
  getAverage?: (player: Player) => number,
) => {
  const sums = team.reduce(
    (acc, player) => {
      acc.attack += player.attack;
      acc.defense += player.defense;
      acc.physical += player.physical;
      acc.vision += player.vision;
      acc.technique += player.technique;
      acc.average += getAverage ? getAverage(player) : player.average;
      return acc;
    },
    { attack: 0, defense: 0, physical: 0, vision: 0, average: 0, technique: 0 },
  );

  return {
    attack: sums.attack,
    defense: sums.defense,
    physical: sums.physical,
    vision: sums.vision,
    technique: sums.technique,
    average: sums.average,
  };
};

/**
 * Positive = team1 has advantage (using averages)
 */
export const calculateTeamDifference = (
  team1: Player[],
  team2: Player[],
  getAverage?: (player: Player) => number,
) => {
  const totals1 = calculateTotalsPerStat(team1, getAverage);
  const totals2 = calculateTotalsPerStat(team2, getAverage);

  const team1Average = totals1.average / team1.length;
  const team2Average = totals2.average / team2.length;

  return team1Average - team2Average;
};

const sortPlayers = (
  a: Player,
  b: Player,
  getAverage?: (player: Player) => number,
) => {
  const avgA = getAverage ? getAverage(a) : a.average;
  const avgB = getAverage ? getAverage(b) : b.average;
  if (avgA !== avgB) {
    return avgB - avgA;
  }
  return a.name.localeCompare(b.name);
};

export const sortTeamsAndUpdateDifference = (
  team1: Player[],
  team2: Player[],
  getAverage?: (player: Player) => number,
) => {
  const sortedTeam1 = [...team1].sort((a, b) => sortPlayers(a, b, getAverage));
  const sortedTeam2 = [...team2].sort((a, b) => sortPlayers(a, b, getAverage));

  const difference = calculateTeamDifference(
    sortedTeam1,
    sortedTeam2,
    getAverage,
  );

  return { team1: sortedTeam1, team2: sortedTeam2, difference };
};

// Generate all possible combinations of k items from an array
const combinations = <T>(array: T[], k: number): T[][] => {
  if (k === 0) return [[]];
  if (k > array.length) return [];

  const result: T[][] = [];
  for (let i = 0; i <= array.length - k; i++) {
    const head = array[i];
    const tailCombinations = combinations(array.slice(i + 1), k - 1);
    for (const tail of tailCombinations) {
      result.push([head, ...tail]);
    }
  }
  return result;
};

// Generate all possible team combinations
export const generateAllTeamCombinations = (
  playerPool: Player[],
  getAverage?: (player: Player) => number,
): Array<{
  team1: Player[];
  team2: Player[];
  trueSkillDiff: number;
  enhancedAvgDiff: number;
  avgDiff: number;
}> => {
  if (playerPool.length < 2) return [];

  const teamSize = Math.floor(playerPool.length / 2);
  const allTeam1Combinations = combinations(playerPool, teamSize);

  const results = [];

  for (const team1 of allTeam1Combinations) {
    const team2 = playerPool.filter((player) => !team1.includes(player));

    // Skip if teams are not equal sized (for odd number of players)
    if (team1.length !== team2.length) continue;

    // Calculate different types of differences
    const trueSkillDiff = calculateTeamDifferenceByMetric(
      team1,
      team2,
      (p) => p.mu || 25,
    );
    const enhancedAvgDiff = calculateTeamDifference(team1, team2, getAverage);
    const avgDiff = calculateTeamDifferenceByMetric(
      team1,
      team2,
      (p) => p.average,
    );

    results.push({
      team1: [...team1].sort((a, b) => sortPlayers(a, b, getAverage)),
      team2: [...team2].sort((a, b) => sortPlayers(a, b, getAverage)),
      trueSkillDiff,
      enhancedAvgDiff,
      avgDiff,
    });
  }

  // Remove duplicates (team1/team2 swapped combinations)
  const uniqueResults = [];
  const seen = new Set<string>();

  for (const result of results) {
    const team1Ids = result.team1
      .map((p) => p._id)
      .sort()
      .join(",");
    const team2Ids = result.team2
      .map((p) => p._id)
      .sort()
      .join(",");
    const key = [team1Ids, team2Ids].sort().join("|");

    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(result);
    }
  }

  return uniqueResults;
};

// Helper function to calculate team difference by any metric (using averages)
const calculateTeamDifferenceByMetric = (
  team1: Player[],
  team2: Player[],
  getMetric: (player: Player) => number,
) => {
  const team1Total = team1.reduce((sum, player) => sum + getMetric(player), 0);
  const team2Total = team2.reduce((sum, player) => sum + getMetric(player), 0);

  const team1Average = team1Total / team1.length;
  const team2Average = team2Total / team2.length;

  return team1Average - team2Average;
};

export const generateTeams = (
  playerPool: Player[],
  getAverage?: (player: Player) => number,
): { team1: Player[]; team2: Player[]; difference: number } => {
  if (playerPool.length < 2) return { team1: [], team2: [], difference: 0 };

  const sortedPlayers = [...playerPool].sort((a, b) =>
    sortPlayers(a, b, getAverage),
  );

  // Initialize teams by alternating players
  const team1 = [];
  const team2 = [];

  let i = 0,
    j = sortedPlayers.length - 1;
  while (i <= j) {
    if (i <= j) team1.push(sortedPlayers[i++]);
    if (i <= j) team2.push(sortedPlayers[i++]);
    if (i <= j) team1.push(sortedPlayers[j--]);
    if (i <= j) team2.push(sortedPlayers[j--]);
  }

  // Try to swap players to improve balance
  for (let k = 0; k < ITERATIONS; k++) {
    const playerIndex1 = Math.floor(Math.random() * team1.length);
    const playerIndex2 = Math.floor(Math.random() * team2.length);
    const originalDifference = calculateTeamDifference(
      team1,
      team2,
      getAverage,
    );

    // Swap players
    [team1[playerIndex1], team2[playerIndex2]] = [
      team2[playerIndex2],
      team1[playerIndex1],
    ];

    const newDifference = calculateTeamDifference(team1, team2, getAverage);

    if (Math.abs(newDifference) > Math.abs(originalDifference)) {
      // Revert the swap if it worsens the balance
      [team1[playerIndex1], team2[playerIndex2]] = [
        team2[playerIndex2],
        team1[playerIndex1],
      ];
    }
  }

  const newTeams = sortTeamsAndUpdateDifference(team1, team2, getAverage);

  if (newTeams.team1[0].name > newTeams.team2[0].name) {
    return {
      team1: newTeams.team2,
      team2: newTeams.team1,
      difference: -newTeams.difference,
    };
  }

  return newTeams;
};
