import { useState } from "react";
import { Player } from "../../data/players";
import {
  parsePlayerList,
  matchPlayersByName,
  logMatchingResults,
} from "../../utils/player-matching";
import "./MatchPlanner.css"; // For button styles
import "./PastePlayersModal.css";

interface PastePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onPlayersMatched: (matchedPlayers: Player[]) => void;
}

export const PastePlayersModal = ({
  isOpen,
  onClose,
  players,
  onPlayersMatched,
}: PastePlayersModalProps) => {
  const [pasteText, setPasteText] = useState("");

  const handlePastePlayerList = () => {
    if (!pasteText.trim()) return;

    const parsedNames = parsePlayerList(pasteText);
    console.log("Parsed player names:", parsedNames);

    const matchingResult = matchPlayersByName(parsedNames, players);
    logMatchingResults(matchingResult);

    // Return matched players to parent component
    onPlayersMatched(matchingResult.matchedPlayers);

    // Close modal and reset text
    onClose();
    setPasteText("");
  };

  const handleClose = () => {
    onClose();
    // Keep the text when closing without processing
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Enganxa la llista de jugadors</h4>
        <p>Enganxa els jugadors, un per línia:</p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="1️⃣ Albert&#10;2️⃣ Andreu&#10;3️⃣ Ribas&#10;..."
          rows={10}
          className="paste-textarea"
        />
        <div className="modal-buttons">
          <button onClick={handlePastePlayerList} className="button">
            Accepta i genera!
          </button>
          <button onClick={handleClose} className="button secondary-button">
            Cancel·la
          </button>
        </div>
      </div>
    </div>
  );
};
