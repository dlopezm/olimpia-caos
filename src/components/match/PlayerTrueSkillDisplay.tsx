import React from "react";
import { Player } from "../../data/players";
import {
  PlayerTrueSkill,
  calculateEnhancedAverage,
} from "../../trueskill-utils";
import { PlayerAvatar } from "../shared/PlayerAvatar";
import { useNavigate } from "react-router-dom";

interface PlayerTrueSkillDisplayProps {
  player: Player;
  beforeRating?: PlayerTrueSkill;
  afterRating?: PlayerTrueSkill;
}

export const PlayerTrueSkillDisplay: React.FC<PlayerTrueSkillDisplayProps> = ({
  player,
  beforeRating,
  afterRating,
}) => {
  const navigate = useNavigate();

  const handlePlayerClick = () => {
    if (!player.isGuest) {
      navigate(`/jugador/${player._id}`);
    }
  };

  // Calculate enhanced average from PlayerTrueSkill data by creating temporary player object
  const calculateEnhancedAverageFromTrueSkill = (
    rating?: PlayerTrueSkill,
  ): number => {
    if (!rating) return player.average;

    // Create temporary player object with the TrueSkill mu to reuse existing function
    const tempPlayer: Player = { ...player, mu: rating.mu };
    return calculateEnhancedAverage(tempPlayer);
  };

  const formatRating = (rating?: PlayerTrueSkill): string => {
    if (!rating) return "N/A";
    return rating.mu.toFixed(1);
  };

  const formatEnhancedAverage = (rating?: PlayerTrueSkill): string => {
    if (!rating) return "N/A";
    return calculateEnhancedAverageFromTrueSkill(rating).toFixed(2);
  };

  // Calculate rating change based on displayed (rounded) values
  const ratingChange =
    beforeRating && afterRating
      ? parseFloat(formatRating(afterRating)) -
        parseFloat(formatRating(beforeRating))
      : 0;

  // Calculate enhanced average change based on displayed (rounded) values
  const enhancedAverageChange =
    beforeRating && afterRating
      ? parseFloat(formatEnhancedAverage(afterRating)) -
        parseFloat(formatEnhancedAverage(beforeRating))
      : 0;

  const getRatingChangeDisplay = () => {
    if (!beforeRating || !afterRating)
      return <span className="rating-change neutral">-</span>;

    // If no change in displayed values, show neutral
    if (ratingChange === 0) {
      return <span className="rating-change neutral">-</span>;
    }

    const isPositive = ratingChange > 0;
    const changeText =
      ratingChange > 0
        ? `+${ratingChange.toFixed(1)}`
        : ratingChange.toFixed(1);

    return (
      <span className={`rating-change ${isPositive ? "positive" : "negative"}`}>
        {changeText}
      </span>
    );
  };

  const getEnhancedAverageChangeDisplay = () => {
    if (!beforeRating || !afterRating)
      return <span className="rating-change neutral">-</span>;

    // If no change in displayed values, show neutral
    if (enhancedAverageChange === 0) {
      return <span className="rating-change neutral">-</span>;
    }

    const isPositive = enhancedAverageChange > 0;
    const changeText =
      enhancedAverageChange > 0
        ? `+${enhancedAverageChange.toFixed(2)}`
        : enhancedAverageChange.toFixed(2);

    return (
      <span className={`rating-change ${isPositive ? "positive" : "negative"}`}>
        {changeText}
      </span>
    );
  };

  return (
    <div className="player-trueskill-display">
      <div
        className={`player-info ${player.isGuest ? "guest-player" : "clickable-player"}`}
        onClick={handlePlayerClick}
        style={{ cursor: player.isGuest ? "default" : "pointer" }}
      >
        <PlayerAvatar
          player={player}
          size={100}
          className="player-avatar-small"
        />
        <span className="player-name">{player.name}</span>
      </div>

      <div className="ratings-table">
        <div className="ratings-header">
          <span className="header-cell"></span>
          <span className="header-cell">Abans</span>
          <span className="header-cell">Després</span>
          <span className="header-cell">Canvi</span>
          <span className="header-cell">Actual</span>
        </div>

        <div className="ratings-row">
          <span className="metric-label">TrueSkill</span>
          <span className="rating-value">{formatRating(beforeRating)}</span>
          <span className="rating-value">{formatRating(afterRating)}</span>
          <span className="change-cell">{getRatingChangeDisplay()}</span>
          <span className="current-value">
            {(player.mu || 25.0).toFixed(1)}
          </span>
        </div>

        <div className="ratings-row">
          <span className="metric-label">Avg+TS</span>
          <span className="rating-value">
            {formatEnhancedAverage(beforeRating)}
          </span>
          <span className="rating-value">
            {formatEnhancedAverage(afterRating)}
          </span>
          <span className="change-cell">
            {getEnhancedAverageChangeDisplay()}
          </span>
          <span className="current-value">
            {(player.enhancedAverage || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
