import React from "react";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { resultToTitle } from "./match-utils";

interface MatchHeaderProps {
  result: "white" | "dark" | "draw";
  date: string;
  localScore?: number;
  awayScore?: number;
  matchId: string;
  onExplore: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  result,
  date,
  localScore,
  awayScore,
  onExplore,
}) => {
  return (
    <div className="match-header-wrapper">
      <div className="match-header">
        <span className={`match-result-badge ${result}`}>
          {resultToTitle(result)}
        </span>

        <div className="match-info-block">
          <div className="top-row">
            <span className="match-date">
              {new Date(date).toLocaleDateString()}
            </span>
            <button className="load-match-button" onClick={onExplore}>
              Explora <FaMagnifyingGlassChart />
            </button>
          </div>

          {localScore != null && awayScore != null && (
            <div className="match-score">
              {localScore}
              <span className="colon">:</span>
              {awayScore}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
