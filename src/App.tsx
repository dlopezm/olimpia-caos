import { useState } from 'react';
import './App.css';
import { Player, PLAYERS } from './data/players';
import { SelectedPlayer } from './SelectedPlayer';
import TeamView from './TeamView';

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
      <h3>Convocatòria</h3>
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
      <button onClick={generateTeams} className="generate-button">
        Genera equips
      </button>
      {teams && (
        <div className="teams-container">
          <TeamView team={teams.team1} teamName="Equip Clar" />
          <TeamView team={teams.team2} teamName="Equip Fosc" />
        </div>
      )}
    </div>
  );
};
