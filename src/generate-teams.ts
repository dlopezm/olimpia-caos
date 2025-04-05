import { Player } from "./data/players";

const ITERATIONS = 50; // Number of iterations for the swap optimization

const calculateAverages = (team: Player[]) => {
    const totalPlayers = team.length;
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
        attack: sums.attack / totalPlayers,
        defense: sums.defense / totalPlayers,
        physical: sums.physical / totalPlayers,
        vision: sums.vision / totalPlayers,
        overall: sums.overall / totalPlayers,
    };
};

const calculateTeamDifference = (team1: Player[], team2: Player[]) => {
    const averages1 = calculateAverages(team1);
    const averages2 = calculateAverages(team2);

    const attackDiff = averages1.attack - averages2.attack;
    const defenseDiff = averages1.defense - averages2.defense;
    const physicalDiff = averages1.physical - averages2.physical;
    const visionDiff = averages1.vision - averages2.vision;
    const overallDiff = averages1.overall - averages2.overall;

    const totalDiff = attackDiff + defenseDiff + physicalDiff + visionDiff + 2 * overallDiff;

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

    // Sort teams by overall average attribute value
    team1.sort(sortPlayers);
    team2.sort(sortPlayers);

    const finalDifference = calculateTeamDifference(team1, team2);

    if (team1[0].name > team2[0].name) {
        return { team1: team2, team2: team1, difference: -finalDifference };
    }

    return { team1, team2, difference: finalDifference };

};