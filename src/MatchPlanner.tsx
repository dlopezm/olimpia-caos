import { useState, useEffect } from "react";
import { Player } from "./data/players";
import { generateTeams, sortTeamsAndUpdateDifference } from "./generate-teams";
import { sanityClient } from "./sanity-client";
import { TeamView } from "./TeamView";
import './MatchPlanner.css';


export const MatchPlanner = () => {
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const query = `*[_type == "player"]{
                    _id,
                    name,
                    attack,
                    defense,
                    physical,
                    vision,
                    technique,
                    "average": (attack + defense + physical + vision + technique) / 5
                  }`;
                const playersData = await sanityClient.fetch(query);
                // Sort players by name
                playersData.sort((a: Player, b: Player) => a.name.localeCompare(b.name));
                setAllPlayers(playersData);
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };

        fetchPlayers();
    }, []);

    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<{ team1: Player[], team2: Player[], difference: number } | null>(null);

    const handlePlayerSelect = (player: Player) => {
        setSelectedPlayers((prevSelected) =>
            prevSelected.includes(player)
                ? prevSelected.filter((p) => p !== player)
                : [...prevSelected, player]
        );
    };

    const onGenerateTeams = () => {
        const teams = generateTeams(selectedPlayers);
        setTeams(teams);
    };

    const onClickPlayer = (player: Player) => {
        if (!teams) return;
        const playerIndex = teams.team1.indexOf(player);
        const playerIndex2 = teams.team2.indexOf(player);
        if (playerIndex !== -1) {
            setTeams((prevTeams) => {
                if (!prevTeams) return null;
                const newTeam1 = [...prevTeams.team1];
                newTeam1.splice(playerIndex, 1);
                const newTeam2 = [...prevTeams.team2, player];
                return sortTeamsAndUpdateDifference(newTeam1, newTeam2);
            }
            );
        }
        if (playerIndex2 !== -1) {
            setTeams((prevTeams) => {
                if (!prevTeams) return null;
                const newTeam2 = [...prevTeams.team2];
                newTeam2.splice(playerIndex2, 1);
                const newTeam1 = [...prevTeams.team1, player];
                return sortTeamsAndUpdateDifference(newTeam1, newTeam2);
            }
            );
        }
    };
    return (
        <div className="match-planner">
            <h3>Convocatòria</h3>
            <div className="player-list">
                {allPlayers.map((player, index) => (
                    <div
                        key={index}
                        className={`player-item ${selectedPlayers.includes(player) ? 'selected' : ''}`}
                        onClick={() => handlePlayerSelect(player)}
                    >
                        {player.name}
                    </div>
                ))}
            </div>
            <div className="generate-button-wrapper">
                <button
                    onClick={onGenerateTeams}
                    className="generate-button"
                    disabled={selectedPlayers.length < 2}
                >
                    Genera equips
                </button>
            </div>

            {teams && (
                <>
                    <div className="difference-message">
                        {teams.difference === 0 ? (
                            <div>Igualtat màxima al terreny de joc!</div>
                        ) : (
                            <div>
                                Diferència de {Math.abs(teams.difference).toFixed(2)} punts màgics a favor de l'equip {teams.difference > 0 ? '◻️' : '◼️'}
                            </div>
                        )}
                    </div>
                    <div className="teams-container">
                        <TeamView team={teams.team1} teamName="Equip ◻️" onClickPlayer={onClickPlayer} />
                        <TeamView team={teams.team2} teamName="Equip ◼️" onClickPlayer={onClickPlayer} />
                    </div>
                </>
            )}

        </div>
    );
}