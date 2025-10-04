import { useState, useEffect, useMemo } from "react";
import { Player } from "../../data/players";
import {
  generateTeams,
  generateAllTeamCombinations,
  sortTeamsAndUpdateDifference,
} from "../../generate-teams";
import { TeamView } from "./TeamView";
import { TeamComparison } from "../shared/TeamComparison";
import "./MatchPlanner.css";
import { ShareButton } from "./ShareButton";
import { calculateEnhancedAverage } from "../../trueskill-utils";
import { formatTeamForSharing } from "../../utils/team-utils";
import { useData } from "../../stores/DataStore";
import { PastePlayersModal } from "./PastePlayersModal";
import { AllCombinationsTable } from "./AllCombinationsTable";

function getParamIds(param: string | null): string[] {
  return (
    param
      ?.split(",")
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean) || []
  );
}

export const MatchPlanner = () => {
  const { players, loading, error } = useData();
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [shareMessage, setShareMessage] = useState<string>("");
  const [teams, setTeams] = useState<{
    team1: Player[];
    team2: Player[];
    difference: number;
  } | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showAllCombinations, setShowAllCombinations] = useState(false);
  const [allCombinations, setAllCombinations] = useState<
    Array<{
      team1: Player[];
      team2: Player[];
      trueSkillDiff: number;
      enhancedAvgDiff: number;
      avgDiff: number;
    }>
  >([]);

  const nonGuestPlayers = useMemo(
    () => players.filter((player) => !player.isGuest),
    [players],
  );

  // Update the URL when teams change
  useEffect(() => {
    if (!teams) return;

    const shortId = (player: Player) => player._id.slice(0, 5);
    const lightIds = teams.team1.map(shortId);
    const darkIds = teams.team2.map(shortId);

    const params = new URLSearchParams();
    if (lightIds.length > 0) params.set("light", lightIds.join(","));
    if (darkIds.length > 0) params.set("dark", darkIds.join(","));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [teams]);

  // Load teams from URL when data is available
  useEffect(() => {
    if (players.length === 0) return;

    // Get params from URL
    const url = new URL(window.location.href);
    const lightIds = getParamIds(url.searchParams.get("light"));
    const darkIds = getParamIds(url.searchParams.get("dark"));

    // Match IDs using the first 5 characters
    const matchByPrefix = (prefixes: string[]) =>
      players.filter((player) =>
        prefixes.some((prefix) => player._id.startsWith(prefix)),
      );

    const lightTeam = matchByPrefix(lightIds);
    const darkTeam = matchByPrefix(darkIds);
    const allSelected = [...lightTeam, ...darkTeam];

    if (allSelected.length > 0) {
      setSelectedPlayers(allSelected);
      setTeams(
        sortTeamsAndUpdateDifference(
          lightTeam,
          darkTeam,
          calculateEnhancedAverage,
        ),
      );
    }
  }, [players]);

  useEffect(() => {
    if (!teams) return;

    const output = [
      formatTeamForSharing(teams.team1, "▫️"),
      formatTeamForSharing(teams.team2, "◾️"),
    ].join("\n");
    setShareMessage(output);
    console.log(output);
  }, [teams]);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.includes(player)
        ? prev.filter((p) => p !== player)
        : [...prev, player],
    );
  };

  const onGenerateTeams = () => {
    const teams = generateTeams(selectedPlayers, calculateEnhancedAverage);
    setTeams(teams);
  };

  const onAnalyzeAllCombinations = () => {
    const combinations = generateAllTeamCombinations(
      selectedPlayers,
      calculateEnhancedAverage,
    );
    setAllCombinations(combinations);
    setShowAllCombinations(true);
  };

  const handlePlayersMatched = (matchedPlayers: Player[]) => {
    // Add matched players to selection
    if (matchedPlayers.length > 0) {
      setSelectedPlayers(matchedPlayers);

      // Auto-generate teams if we have enough players (2 or more)
      if (matchedPlayers.length >= 2) {
        setTimeout(() => {
          const teams = generateTeams(matchedPlayers, calculateEnhancedAverage);
          setTeams(teams);
        }, 100); // Small delay to ensure state updates
      }
    }
  };

  const onClickPlayer = (player: Player) => {
    if (!teams) return;
    const playerIndex = teams.team1.indexOf(player);
    const playerIndex2 = teams.team2.indexOf(player);
    if (playerIndex !== -1) {
      setTeams((prev) => {
        if (!prev) return null;
        const newTeam1 = [...prev.team1];
        newTeam1.splice(playerIndex, 1);
        const newTeam2 = [...prev.team2, player];
        return sortTeamsAndUpdateDifference(
          newTeam1,
          newTeam2,
          calculateEnhancedAverage,
        );
      });
    }
    if (playerIndex2 !== -1) {
      setTeams((prev) => {
        if (!prev) return null;
        const newTeam2 = [...prev.team2];
        newTeam2.splice(playerIndex2, 1);
        const newTeam1 = [...prev.team1, player];
        return sortTeamsAndUpdateDifference(
          newTeam1,
          newTeam2,
          calculateEnhancedAverage,
        );
      });
    }
  };

  if (loading) {
    return <div>Carregant dades...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="match-planner">
      <h3>Convocatòria</h3>
      <div className="player-list">
        {nonGuestPlayers.map((player) => (
          <div
            key={player._id}
            className={`player-item ${
              selectedPlayers.includes(player) ? "selected" : ""
            }`}
            onClick={() => handlePlayerSelect(player)}
          >
            {player.name}
          </div>
        ))}
      </div>

      <div className="button-wrapper">
        <button
          onClick={() => setShowPasteModal(true)}
          className="button paste-button"
        >
          📋
        </button>
        <button
          onClick={onGenerateTeams}
          className="button"
          disabled={selectedPlayers.length < 2}
        >
          Genera equips
        </button>
        <button
          onClick={onAnalyzeAllCombinations}
          className="button analyze-button"
          disabled={selectedPlayers.length < 4 || selectedPlayers.length > 12}
          title={
            selectedPlayers.length < 4
              ? "Mínim 4 jugadors"
              : selectedPlayers.length > 12
                ? "Màxim 12 jugadors (massa combinacions)"
                : "Analitza totes les combinacions possibles"
          }
        >
          📊 Analitza totes
        </button>
      </div>

      {teams && (
        <>
          <div className="difference-message">
            {Math.abs(teams.difference).toFixed(2) === "0.00" ? (
              <div>Igualtat màxima al terreny de joc!</div>
            ) : (
              <div>
                Diferència de {Math.abs(teams.difference).toFixed(2)} punts de
                crack a favor de l'equip {teams.difference > 0 ? "◻️" : "◼️"}
              </div>
            )}
          </div>

          <TeamComparison team1={teams.team1} team2={teams.team2} />

          <div className="teams-container">
            <TeamView
              players={teams.team1}
              teamName="Equip ◻️"
              teamColor="light"
              onClickPlayer={onClickPlayer}
              advantage={teams.difference}
            />
            <TeamView
              players={teams.team2}
              teamName="Equip ◼️"
              teamColor="dark"
              onClickPlayer={onClickPlayer}
              advantage={-teams.difference}
            />
          </div>
          <ShareButton text={shareMessage} />
        </>
      )}

      <PastePlayersModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        players={nonGuestPlayers}
        onPlayersMatched={handlePlayersMatched}
      />

      {showAllCombinations && (
        <AllCombinationsTable
          combinations={allCombinations}
          onClose={() => setShowAllCombinations(false)}
        />
      )}
    </div>
  );
};
