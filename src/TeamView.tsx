import React, { useMemo } from 'react';
import { Player } from './data/players';
import './TeamView.css';
import { SelectedPlayer } from './SelectedPlayer';

interface TeamProps {
  team: Player[];
  teamName: string;
}

const TeamView: React.FC<TeamProps> = ({ team, teamName }) => {
    const averages = useMemo(() => {
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
      attack: (sums.attack / totalPlayers).toFixed(2),
      defense: (sums.defense / totalPlayers).toFixed(2),
      physical: (sums.physical / totalPlayers).toFixed(2),
      vision: (sums.vision / totalPlayers).toFixed(2),
      overall: (sums.overall / totalPlayers).toFixed(2),
    };
  }, [team]);

  return (
    <div className="team">
      <h3>{teamName}</h3>
      <div className="team-averages">
        <div>Mitjana: {averages.overall}</div>
        <div>Atac: {averages.attack}</div>
        <div>Defensa: {averages.defense}</div>
        <div>Físic: {averages.physical}</div>
        <div>Visió: {averages.vision}</div>
      </div>
      <div className="team-players-grid">
        {team.map((player, index) => (
          <SelectedPlayer key={index} player={player} />
        ))}
      </div>
    </div>
  );
};

export default TeamView;
