import React from "react";
import "./CombinedBar.css";

type CombinedBarProps = {
  label: string;
  leftValue: number;
  rightValue: number;
};

const roundToTwoDecimals = (value: number) => {
  return Math.round(value * 100) / 100;
};

export const CombinedBar: React.FC<CombinedBarProps> = ({
  label,
  leftValue,
  rightValue,
}) => {
  const left = roundToTwoDecimals(leftValue);
  const right = roundToTwoDecimals(rightValue);
  const total = left + right;
  const leftRatio = total > 0 ? left / total : 0.5;

  return (
    <div className="combined-bar">
      <div className="label">{label}</div>
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
