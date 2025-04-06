import { useState, useEffect } from "react";
import { Player } from "./data/players";
import { generateTeams, sortTeamsAndUpdateDifference } from "./generate-teams";
import { sanityClient } from "./sanity-client";
import { TeamView } from "./TeamView";
import { TeamComparison } from "./TeamComparison";
import "./MatchPlanner.css";

export const MatchPlanner = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{
    team1: Player[];
    team2: Player[];
    difference: number;
  } | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const query = `*[_type == "player" && !isGuest]{
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
        playersData.sort((a: Player, b: Player) =>
          a.name.localeCompare(b.name),
        );
        setAllPlayers(playersData);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.includes(player)
        ? prev.filter((p) => p !== player)
        : [...prev, player],
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
      setTeams((prev) => {
        if (!prev) return null;
        const newTeam1 = [...prev.team1];
        newTeam1.splice(playerIndex, 1);
        const newTeam2 = [...prev.team2, player];
        return sortTeamsAndUpdateDifference(newTeam1, newTeam2);
      });
    }
    if (playerIndex2 !== -1) {
      setTeams((prev) => {
        if (!prev) return null;
        const newTeam2 = [...prev.team2];
        newTeam2.splice(playerIndex2, 1);
        const newTeam1 = [...prev.team1, player];
        return sortTeamsAndUpdateDifference(newTeam1, newTeam2);
      });
    }
  };

  return (
    <div className="match-planner">
      <h3>Convocatòria</h3>
      <div className="player-list">
        {allPlayers.map((player, index) => (
          <div
            key={index}
            className={`player-item ${
              selectedPlayers.includes(player) ? "selected" : ""
            }`}
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
                Diferència de {Math.abs(teams.difference).toFixed(2)} punts de
                crack a favor de l'equip {teams.difference > 0 ? "◻️" : "◼️"}
              </div>
            )}
          </div>

          <TeamComparison team1={teams.team1} team2={teams.team2} />

          <div className="teams-container">
            <TeamView
              players={teams.team1}
              teamName="Equip ◻️"
              teamColor="light"
              onClickPlayer={onClickPlayer}
            />
            <TeamView
              players={teams.team2}
              teamName="Equip ◼️"
              teamColor="dark"
              onClickPlayer={onClickPlayer}
            />
          </div>
        </>
      )}
    </div>
  );
};
