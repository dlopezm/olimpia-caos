import { useEffect, useState } from 'react';
import './App.css';
import { Player } from './data/players';
import { TeamView } from './TeamView';
import { generateTeams } from './generate-teams';
import { sanityClient } from './sanity-client';

export const App = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const query = '*[_type == "player"]';
        const playersData = await sanityClient.fetch(query);
        setAllPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, []);

  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ team1: Player[], team2: Player[] } | null>(null);

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

  return (
    <div className="App">
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
      <button onClick={onGenerateTeams} className="generate-button">
        Genera equips
      </button>
      {teams && (
        <div className="teams-container">
          <TeamView team={teams.team1} teamName="Equip ◻️" />
          <TeamView team={teams.team2} teamName="Equip ◼️" />
        </div>
      )}
    </div>
  );
};
