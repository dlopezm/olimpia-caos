import React from "react";
import { Player } from "../../data/players";
import { CombinedBar } from "./CombinedBar";
import "./TeamComparison.css";

type Props = {
  team1: Player[];
  team2: Player[];
  compact?: boolean;
};

export const TeamComparison: React.FC<Props> = ({
  team1,
  team2,
  compact = false,
}) => {
  // Summation logic
  const getTotals = (team: Player[]) =>
    team.reduce(
      (acc, p) => ({
        attack: acc.attack + p.attack,
        defense: acc.defense + p.defense,
        physical: acc.physical + p.physical,
        vision: acc.vision + p.vision,
        technique: acc.technique + p.technique,
        average: acc.average + p.average,
      }),
      {
        attack: 0,
        defense: 0,
        physical: 0,
        vision: 0,
        technique: 0,
        average: 0,
      },
    );

  const totals1 = getTotals(team1);
  const totals2 = getTotals(team2);

  const metrics = [
    {
      label: "Mitjana",
      left: totals1.average / team1.length,
      right: totals2.average / team2.length,
    },
    {
      label: "Atac",
      left: totals1.attack / team1.length,
      right: totals2.attack / team2.length,
    },
    {
      label: "Defensa",
      left: totals1.defense / team1.length,
      right: totals2.defense / team2.length,
    },
    {
      label: "Físic",
      left: totals1.physical / team1.length,
      right: totals2.physical / team2.length,
    },
    {
      label: "Visió",
      left: totals1.vision / team1.length,
      right: totals2.vision / team2.length,
    },
    {
      label: "Tècnica",
      left: totals1.technique / team1.length,
      right: totals2.technique / team2.length,
    },
  ];

  return (
    <div className={`team-comparison ${compact ? "compact" : ""}`}>
      {compact && (
        <div className="team-names-block">
          <div className="team-names">
            <span className="team-names-label">Equip ◻️</span>
            <p className="team-names-list">
              {team1.map((p) => p.name).join(", ")}
            </p>
          </div>
          <div className="team-names">
            <span className="team-names-label">Equip ◼️</span>
            <p className="team-names-list">
              {team2.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {metrics.map(({ label, left, right }) => (
        <div className="stat-row" key={label}>
          <div className="bar-wrapper">
            <div className="stat-label-side">{label}</div>
            <div className="centered-bar">
              <CombinedBar
                leftValue={left}
                rightValue={right}
                compact={compact}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
