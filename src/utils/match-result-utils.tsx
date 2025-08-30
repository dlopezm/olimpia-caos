import React from "react";
import { MatchOutcomeLetter } from "../types/match";

interface ClickableMatchResultProps {
  result: MatchOutcomeLetter;
  matchId?: string;
  navigate?: (path: string) => void;
  size?: "small" | "medium" | "large";
}

export const ClickableMatchResult: React.FC<ClickableMatchResultProps> = ({
  result,
  matchId,
  navigate,
  size = "medium",
}) => {
  const colors = { W: "#4caf50", D: "#ff9800", L: "#f44336" };

  const sizeStyles = {
    small: { width: "16px", height: "16px", fontSize: "10px", padding: "0" },
    medium: {
      width: "20px",
      height: "20px",
      fontSize: "12px",
      padding: "4px 8px",
    },
    large: {
      width: "30px",
      height: "30px",
      fontSize: "14px",
      padding: "6px 12px",
    },
  };

  const handleClick = () => {
    if (matchId && navigate) {
      navigate(`/partit/${matchId}`);
    }
  };

  return (
    <span
      style={{
        width: sizeStyles[size].width,
        height: sizeStyles[size].height,
        borderRadius: "2px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: sizeStyles[size].fontSize,
        fontWeight: "bold",
        color: "white",
        backgroundColor: colors[result],
        cursor: matchId ? "pointer" : "default",
        transition: "all 0.2s ease",
        padding: size === "small" ? "0" : sizeStyles[size].padding,
        minWidth: size === "small" ? sizeStyles[size].width : "20px",
        textAlign: "center" as const,
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (matchId) {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (matchId) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      title={matchId ? "Fer clic per veure els detalls del partit" : ""}
    >
      {result}
    </span>
  );
};
