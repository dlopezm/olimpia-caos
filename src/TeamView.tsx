import React, { useMemo } from 'react';
import { Player } from './data/players';
import './TeamView.css';
import { SelectedPlayer } from './SelectedPlayer';
import { AttributeBar } from './AttributeBar';

interface TeamProps {
  team: Player[];
  teamName: string;
  onClickPlayer: (player: Player) => void;
}

export const TeamView: React.FC<TeamProps> = ({ team, teamName, onClickPlayer }) => {
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
      attack: (sums.attack / totalPlayers),
      defense: (sums.defense / totalPlayers),
      physical: (sums.physical / totalPlayers),
      vision: (sums.vision / totalPlayers),
      overall: (sums.overall / totalPlayers),
    };
  }, [team]);

  return (
    <div className="team">
      <h3>{teamName}</h3>
      <div className="team-averages">
        <AttributeBar label="Mitjana" value={averages.overall} />
        <AttributeBar label="Atac" value={averages.attack} />
        <AttributeBar label="Defensa" value={averages.defense} />
        <AttributeBar label="Físic" value={averages.physical} />
        <AttributeBar label="Visió" value={averages.vision} />
      </div>
      <div className="team-players-grid">
        {team.map((player, index) => (
          <SelectedPlayer key={index} player={player} onClick={onClickPlayer} />
        ))}
      </div>
    </div>
  );
};
