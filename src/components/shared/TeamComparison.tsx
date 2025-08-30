import React from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "../../data/players";
import { CombinedBar } from "./CombinedBar";
import "./TeamComparison.css";
import { calculateEnhancedAverage, PlayerTrueSkill } from "../../trueskill-utils";

type Props = {
  team1: Player[];
  team2: Player[];
  compact?: boolean;
  beforeRatings?: Map<string, PlayerTrueSkill>;
};

export const TeamComparison: React.FC<Props> = ({
  team1,
  team2,
  compact = false,
  beforeRatings,
}) => {
  const navigate = useNavigate();

  // Helper function to navigate to player page
  const handlePlayerClick = (playerId: string) => {
    navigate(`/jugador/${playerId}`);
  };
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
        enhancedAverage: acc.enhancedAverage + calculateEnhancedAverage(p),
        trueSkill: acc.trueSkill + (p.mu || 25.0),
      }),
      {
        attack: 0,
        defense: 0,
        physical: 0,
        vision: 0,
        technique: 0,
        average: 0,
        enhancedAverage: 0,
        trueSkill: 0,
      },
    );

  const totals1 = getTotals(team1);
  const totals2 = getTotals(team2);

  // Calculate TrueSkill averages for before/after if available
  const getTeamTrueSkillAverage = (team: Player[], ratings: Map<string, PlayerTrueSkill> | undefined): number => {
    if (!ratings) return 0;
    const validRatings = team
      .map(player => ratings.get(player._id))
      .filter(rating => rating !== undefined)
      .map(rating => rating!.mu);
    return validRatings.length > 0 
      ? validRatings.reduce((sum, mu) => sum + mu, 0) / validRatings.length 
      : 0;
  };

  const team1BeforeTS = getTeamTrueSkillAverage(team1, beforeRatings);
  const team2BeforeTS = getTeamTrueSkillAverage(team2, beforeRatings);

  const baseMetrics = [
    {
      label: "Mitjana",
      left: totals1.enhancedAverage / team1.length,
      right: totals2.enhancedAverage / team2.length,
    },
    {
      label: "TS Actual",
      left: totals1.trueSkill / team1.length,
      right: totals2.trueSkill / team2.length,
    },
  ];

  const trueSkillMetrics = [];
  if (beforeRatings && team1BeforeTS > 0 && team2BeforeTS > 0) {
    trueSkillMetrics.push({
      label: "TS pre-partit",
      left: team1BeforeTS,
      right: team2BeforeTS,
    });
  }

  const metrics = [
    ...baseMetrics,
    ...trueSkillMetrics,
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
              {team1.map((p, index) => (
                <React.Fragment key={p._id}>
                  <span
                    className="clickable-player-name"
                    onClick={() => handlePlayerClick(p._id)}
                  >
                    {p.name}
                  </span>
                  {index < team1.length - 1 && ", "}
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="team-names">
            <span className="team-names-label">Equip ◼️</span>
            <p className="team-names-list">
              {team2.map((p, index) => (
                <React.Fragment key={p._id}>
                  <span
                    className="clickable-player-name"
                    onClick={() => handlePlayerClick(p._id)}
                  >
                    {p.name}
                  </span>
                  {index < team2.length - 1 && ", "}
                </React.Fragment>
              ))}
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
