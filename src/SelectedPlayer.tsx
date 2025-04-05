import { Player } from "./data/players";

export const SelectedPlayer = ({ player }: { player: Player }) => {
    const average = (player.attack + player.defense + player.physical + player.vision) / 4;
  
    return (
      <div className="selected-item">
        <div className="player-name">{player.name}</div>
        <div className="player-attributes">
          <div>Mitjana: {average.toFixed(2)}</div>
          <div>Atac: {player.attack}</div>
          <div>Defensa: {player.defense}</div>
          <div>Físic: {player.physical}</div>
          <div>Visió: {player.vision}</div>
        </div>
      </div>
    );
  };