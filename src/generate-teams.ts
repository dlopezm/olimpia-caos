import { Player } from "./data/players";

const ITERATIONS = 50; // Number of iterations for the swap optimization

const calculateTotalsPerStat = (team: Player[]) => {
    const sums = team.reduce(
        (acc, player) => {
            acc.attack += player.attack;
            acc.defense += player.defense;
            acc.physical += player.physical;
            acc.vision += player.vision;
            acc.overall += (player.attack + player.defense + player.physical + player.vision) / 4;
            return acc;
        },
        { attack: 0, defense: 0, physical: 0, vision: 0, overall: 0 }
    );

    return {
        attack: sums.attack,
        defense: sums.defense,
        physical: sums.physical,
        vision: sums.vision,
        overall: sums.overall,
    };
};

const calculateTeamDifference = (team1: Player[], team2: Player[]) => {
    const totals1 = calculateTotalsPerStat(team1);
    const totals2 = calculateTotalsPerStat(team2);

    const attackDiff = totals1.attack - totals2.attack;
    const defenseDiff = totals1.defense - totals2.defense;
    const physicalDiff = totals1.physical - totals2.physical;
    const visionDiff = totals1.vision - totals2.vision;
    const overallDiff = (totals1.overall - totals2.overall) * 2; // Apply a weight to the overall average

    // Euclidean distance
    const totalDiff = Math.sqrt(
        attackDiff * attackDiff +
        defenseDiff * defenseDiff +
        physicalDiff * physicalDiff +
        visionDiff * visionDiff +
        overallDiff * overallDiff
    );

    return totalDiff;
};
const sortPlayers = (a: Player, b: Player) => {
    const averageA = (a.attack + a.defense + a.physical + a.vision) / 4;
    const averageB = (b.attack + b.defense + b.physical + b.vision) / 4;
    if (averageA !== averageB) {
        return averageB - averageA;
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

    const sortedPlayers = [...playerPool].sort((a, b) => {
        const averageA = (a.attack + a.defense + a.physical + a.vision) / 4;
        const averageB = (b.attack + b.defense + b.physical + b.vision) / 4;
        return averageB - averageA;
    });

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

        if (Math.abs(newDifference) >= Math.abs(originalDifference)) {
            // Revert the swap if doesn't improve the balance
            [team1[playerIndex1], team2[playerIndex2]] = [team2[playerIndex2], team1[playerIndex1]];
        }
    }

    const newTeams = sortTeamsAndUpdateDifference(team1, team2);

    if (newTeams.team1[0].name > newTeams.team2[0].name) {
        return { team1: newTeams.team2, team2: newTeams.team1, difference: -newTeams.difference };
    }

    return newTeams;

};