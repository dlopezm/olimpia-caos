import { useState, useEffect, useMemo } from "react";
import { Player } from "../../data/players";
import {
  generateTeams,
  sortTeamsAndUpdateDifference,
} from "../../generate-teams";
import { sanityClient } from "../../sanity-client";
import { TeamView } from "./TeamView";
import { TeamComparison } from "../shared/TeamComparison";
import "./MatchPlanner.css";
import { allPlayersQuery } from "../../data-utils";

function getParamIds(param: string | null): string[] {
  return (
    param
      ?.split(",")
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean) || []
  );
}

export const MatchPlanner = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{
    team1: Player[];
    team2: Player[];
    difference: number;
  } | null>(null);

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

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersData: Player[] = await sanityClient.fetch(
          allPlayersQuery(true),
        );
        playersData.sort((a: Player, b: Player) =>
          a.name.localeCompare(b.name),
        );
        setAllPlayers(playersData);

        // Get params from URL
        const url = new URL(window.location.href);
        const lightIds = getParamIds(url.searchParams.get("light"));
        const darkIds = getParamIds(url.searchParams.get("dark"));

        // Match IDs using the first 5 characters
        const matchByPrefix = (prefixes: string[]) =>
          playersData.filter((player) =>
            prefixes.some((prefix) => player._id.startsWith(prefix)),
          );

        const lightTeam = matchByPrefix(lightIds);
        const darkTeam = matchByPrefix(darkIds);
        const allSelected = [...lightTeam, ...darkTeam];

        if (allSelected.length > 0) {
          setSelectedPlayers(allSelected);
          setTeams(sortTeamsAndUpdateDifference(lightTeam, darkTeam));
        }
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  const nonGuestPlayers = useMemo(
    () => allPlayers.filter((player) => !player.isGuest),
    [allPlayers],
  );

  useEffect(() => {
    if (!teams) return;

    const formatTeam = (players: Player[], symbol: string) => {
      const average =
        players.reduce((acc, p) => acc + p.average, 0) / players.length;
      return [
        `Equip ${symbol}: ${average.toFixed(2)}`,
        ...players.map((p) => ` ${symbol} ${p.name}`),
      ].join("\n");
    };

    const currentUrl = new URL(window.location.href);
    const output = [
      `\`\`\`${formatTeam(teams.team1, "▫️")}`,
      `${formatTeam(teams.team2, "◾️")}`,
      currentUrl,
      `\`\`\``,
    ].join("\n");

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
    const teams = generateTeams(selectedPlayers);
    setTeams(teams);
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
        return sortTeamsAndUpdateDifference(newTeam1, newTeam2);
      });
    }
    if (playerIndex2 !== -1) {
      setTeams((prev) => {
        if (!prev) return null;
        const newTeam2 = [...prev.team2];
        newTeam2.splice(playerIndex2, 1);
        const newTeam1 = [...prev.team1, player];
        return sortTeamsAndUpdateDifference(newTeam1, newTeam2);
      });
    }
  };

  return (
    <div className="match-planner">
      <h3>Convocatòria</h3>
      <div className="player-list">
        {nonGuestPlayers.map((player, index) => (
          <div
            key={index}
            className={`player-item ${
              selectedPlayers.includes(player) ? "selected" : ""
            }`}
            onClick={() => handlePlayerSelect(player)}
          >
            {player.name}
          </div>
        ))}
      </div>

      <div className="generate-button-wrapper">
        <button
          onClick={onGenerateTeams}
          className="generate-button"
          disabled={selectedPlayers.length < 2}
        >
          Genera equips
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
            />
            <TeamView
              players={teams.team2}
              teamName="Equip ◼️"
              teamColor="dark"
              onClickPlayer={onClickPlayer}
            />
          </div>
        </>
      )}
    </div>
  );
};
