import React from "react";
import { Player } from "../../data/players";
import { CombinedBar } from "./CombinedBar";

type Props = {
  team1: Player[];
  team2: Player[];
  compact?: boolean; // 🌶️ New!
};

export const TeamComparison: React.FC<Props> = ({
  team1,
  team2,
  compact = false,
}) => {
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

  const barProps = compact ? { compact: true } : {};

  return (
    <div className={`combined-stats ${compact ? "compact" : ""}`}>
      <CombinedBar
        label="Mitjana"
        leftValue={totals1.average / team1.length}
        rightValue={totals2.average / team2.length}
        {...barProps}
      />
      <CombinedBar
        label="Atac"
        leftValue={totals1.attack / team1.length}
        rightValue={totals2.attack / team2.length}
        {...barProps}
      />
      <CombinedBar
        label="Defensa"
        leftValue={totals1.defense / team1.length}
        rightValue={totals2.defense / team2.length}
        {...barProps}
      />
      <CombinedBar
        label="Físic"
        leftValue={totals1.physical / team1.length}
        rightValue={totals2.physical / team2.length}
        {...barProps}
      />
      <CombinedBar
        label="Visió"
        leftValue={totals1.vision / team1.length}
        rightValue={totals2.vision / team2.length}
        {...barProps}
      />
      <CombinedBar
        label="Tècnica"
        leftValue={totals1.technique / team1.length}
        rightValue={totals2.technique / team2.length}
        {...barProps}
      />
    </div>
  );
};
