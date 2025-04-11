import React from "react";
import "./CombinedBar.css";

type CombinedBarProps = {
  leftValue: number;
  rightValue: number;
  compact?: boolean;
};

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

export const CombinedBar: React.FC<CombinedBarProps> = ({
  leftValue,
  rightValue,
  compact = false,
}) => {
  const left = roundToTwoDecimals(leftValue);
  const right = roundToTwoDecimals(rightValue);
  const total = left + right;
  const leftRatio = total > 0 ? left / total : 0.5;

  return (
    <div className={`combined-bar ${compact ? "compact" : ""}`}>
      <div className="bar">
        <div className="stat-value left">{left}</div>
        <div className="fill team1" style={{ width: `${leftRatio * 100}%` }} />
        <div
          className="fill team2"
          style={{ width: `${(1 - leftRatio) * 100}%` }}
        />
        <div className="stat-value right">{right}</div>
      </div>
    </div>
  );
};
