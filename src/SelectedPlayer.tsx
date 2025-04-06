import { Player } from "./data/players";

interface SelectedPlayerProps {
  player: Player;
  onClick?: (player: Player) => void;
}

export const TeamPlayer = ({ player, onClick }: SelectedPlayerProps) => {
  const average =
    (player.attack +
      player.defense +
      player.physical +
      player.vision +
      player.technique) /
    5;

  return (
    <div className="selected-item" onClick={() => onClick?.(player)}>
      <div className="player-name">{player.name}</div>
      <div className="player-attributes">
        <div>Mitjana: {average.toFixed(2)}</div>
        <div>Atac: {player.attack}</div>
        <div>Defensa: {player.defense}</div>
        <div>Físic: {player.physical}</div>
        <div>Visió: {player.vision}</div>
        <div>Tècnica: {player.technique}</div>
      </div>
    </div>
  );
};
