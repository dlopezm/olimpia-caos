import { Player } from "./data/players";

const ITERATIONS = 50; // Number of iterations for the swap optimization

const calculateTotalsPerStat = (team: Player[]) => {
    const sums = team.reduce(
        (acc, player) => {
            acc.attack += player.attack;
            acc.defense += player.defense;
            acc.physical += player.physical;
            acc.vision += player.vision;
            acc.technique += player.technique;
            acc.average += player.average;
            return acc;
        },
        { attack: 0, defense: 0, physical: 0, vision: 0, average: 0, technique: 0 }
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

const calculateTeamDifference = (team1: Player[], team2: Player[]) => {
    const totals1 = calculateTotalsPerStat(team1);
    const totals2 = calculateTotalsPerStat(team2);

    const attackDiff = totals1.attack - totals2.attack;
    const defenseDiff = totals1.defense - totals2.defense;
    const physicalDiff = totals1.physical - totals2.physical;
    const visionDiff = totals1.vision - totals2.vision;
    const techniqueDiff = totals1.technique - totals2.technique;
    const averageDiff = (totals1.average - totals2.average) * 2; // overall average is more important

    // Euclidean distance
    const totalDiff = Math.sqrt(
        attackDiff * attackDiff +
        defenseDiff * defenseDiff +
        physicalDiff * physicalDiff +
        visionDiff * visionDiff +
        techniqueDiff * techniqueDiff +
        averageDiff * averageDiff
    );

    return totalDiff;
};
const sortPlayers = (a: Player, b: Player) => {
    if (a.average !== b.average) {
        return b.average - a.average;
    }
    return a.name.localeCompare(b.name);
}

export const sortTeamsAndUpdateDifference = (team1: Player[], team2: Player[]) => {
    const sortedTeam1 = [...team1].sort(sortPlayers);
    const sortedTeam2 = [...team2].sort(sortPlayers);

    const difference = calculateTeamDifference(sortedTeam1, sortedTeam2);

    return { team1: sortedTeam1, team2: sortedTeam2, difference };
}

export const generateTeams = (playerPool: Player[]): { team1: Player[], team2: Player[], difference: number } => {
    if (playerPool.length < 2) return { team1: [], team2: [], difference: 0 };

    const sortedPlayers = [...playerPool].sort(sortPlayers);

    // Initialize teams by alternating players
    const team1 = [];
    const team2 = [];

    let i = 0, j = sortedPlayers.length - 1;
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
        const originalDifference = calculateTeamDifference(team1, team2);

        // Swap players
        [team1[playerIndex1], team2[playerIndex2]] = [team2[playerIndex2], team1[playerIndex1]];

        const newDifference = calculateTeamDifference(team1, team2);

        if (Math.abs(newDifference) > Math.abs(originalDifference)) {
            // Revert the swap if it worsens the balance
            [team1[playerIndex1], team2[playerIndex2]] = [team2[playerIndex2], team1[playerIndex1]];
        }
    }

    const newTeams = sortTeamsAndUpdateDifference(team1, team2);

    if (newTeams.team1[0].name > newTeams.team2[0].name) {
        return { team1: newTeams.team2, team2: newTeams.team1, difference: -newTeams.difference };
    }

    return newTeams;

};