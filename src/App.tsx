import { useState } from 'react';
import './App.css';
import { Player, PLAYERS } from './data/players';

export const App = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ team1: Player[], team2: Player[] } | null>(null);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayers((prevSelected) =>
      prevSelected.includes(player)
        ? prevSelected.filter((p) => p !== player)
        : [...prevSelected, player]
    );
  };

  const generateTeams = () => {
    if (selectedPlayers.length < 2) return;

    const shuffledPlayers = [...selectedPlayers].sort(() => 0.5 - Math.random());
    const half = Math.floor(shuffledPlayers.length / 2);

    const team1 = shuffledPlayers.slice(0, half);
    const team2 = shuffledPlayers.slice(half);

    setTeams({ team1, team2 });
  };

  return (
    <div className="App">
      <h1>Selecciona Jugadors</h1>
      <div className="player-list">
        {PLAYERS.map((player, index) => (
          <div
            key={index}
            className={`player-item ${selectedPlayers.includes(player) ? 'selected' : ''}`}
            onClick={() => handlePlayerSelect(player)}
          >
            {player.name}
          </div>
        ))}
      </div>
      <h2>Convocatòria</h2>
      <div className="selected-list">
        {selectedPlayers.map((player, index) => (
          <div key={index} className="selected-item">
            {player.name} - Atac: {player.attack}, Defensa: {player.defense}, Físic: {player.physical}, Visió: {player.vision}
          </div>
        ))}
      </div>
      <button onClick={generateTeams} className="generate-button">
        Genera equips
      </button>
      {teams && (
        <div className="teams-container">
          <div className="team">
            <h3>Team 1</h3>
            {teams.team1.map((player, index) => (
              <div key={index} className="team-item">
                {player.name} - Atac: {player.attack}, Defensa: {player.defense}, Físic: {player.physical}, Visió: {player.vision}
              </div>
            ))}
          </div>
          <div className="team">
            <h3>Team 2</h3>
            {teams.team2.map((player, index) => (
              <div key={index} className="team-item">
                {player.name} - Atac: {player.attack}, Defensa: {player.defense}, Físic: {player.physical}, Visió: {player.vision}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
