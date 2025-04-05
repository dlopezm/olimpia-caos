import './TeamSummary.css';

interface Player {
  _id: string;
  name: string;
  attack: number;
  defense: number;
  physical: number;
  vision: number;
  technique: number;
}

interface Props {
  players: Player[];
  label: string; // e.g. "◻️"
}

const calculateTeamAverages = (players: Player[]) => {
  if (players.length === 0) return null;

  const total = players.reduce(
    (acc, p) => ({
      attack: acc.attack + p.attack,
      defense: acc.defense + p.defense,
      physical: acc.physical + p.physical,
      vision: acc.vision + p.vision,
      technique: acc.technique + p.technique,
      overall: acc.overall + ((p.attack + p.defense + p.physical + p.vision + p.technique) / 5),
    }),
    { attack: 0, defense: 0, physical: 0, vision: 0, technique: 0, overall: 0 }
  );

  const count = players.length;
  return {
    attack: (total.attack / count).toFixed(1),
    defense: (total.defense / count).toFixed(1),
    physical: (total.physical / count).toFixed(1),
    vision: (total.vision / count).toFixed(1),
    technique: (total.technique / count).toFixed(1),
    overall: (total.overall / count).toFixed(2),
  };
};

export const TeamSummary = ({ players, label }: Props) => {
  const stats = calculateTeamAverages(players);

  return (
    <div className="team-summary">
      <div>
        <span className="team-label">{label}</span>
        {players.map((p) => p.name).join(", ")}
      </div>
      {stats && (
        <div className="team-averages">
          <small>
            <strong> MITJA {stats.overall}</strong> : ATK {stats.attack} | DEF {stats.defense} | FIS {stats.physical} | VIS {stats.vision} | TEC {stats.technique}
            
          </small>
        </div>
      )}
    </div>
  );
};
