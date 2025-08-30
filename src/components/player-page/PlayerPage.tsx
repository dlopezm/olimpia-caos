import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../stores/DataStore";
import { TRUESKILL_CONSTANTS } from "../../constants";
import { PlayerAvatar } from "../shared/PlayerAvatar";
import { calculatePlayerPairStats } from "../../utils/player-pair-stats";
import { ClickableMatchResult } from "../../utils/match-result-utils";
import {
  DataGrid,
  GridColDef,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import "./PlayerPage.css";

const getBackgroundColor = (value: number): string => {
  if (value >= 4.25) return "#e0f2f1";
  if (value >= 3.75) return "#e8f5e9";
  if (value >= 3) return "#fffde7";
  if (value >= 2.25) return "#fff3e0";
  return "#ffebee";
};

const renderStatRow = (value: number, label: string) => {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}:</span>
      <span
        className="stat-value"
        style={{ backgroundColor: getBackgroundColor(value) }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
};

const renderStatRowWithTooltip = (value: number, label: string, tooltip: string) => {
  return (
    <div className="stat-row">
      <span className="stat-label" title={tooltip}>{label}:</span>
      <span
        className="stat-value"
        style={{ backgroundColor: getBackgroundColor(value) }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
};

export const PlayerPage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { getNonGuestPlayers, matches, loading, error } = useData();
  const navigate = useNavigate();

  const players = getNonGuestPlayers();
  const player = players.find((p) => p._id === playerId);

  // Helper function to find player by name and navigate to their page
  const handlePlayerClick = (playerName: string) => {
    const targetPlayer = players.find((p) => p.name === playerName);
    if (targetPlayer) {
      navigate(`/jugador/${targetPlayer._id}`);
    }
  };

  if (loading) {
    return <div className="loading">Carregant dades...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!player) {
    return <div className="error">Jugador no trobat</div>;
  }

  // Calculate player pair statistics
  const pairStats = calculatePlayerPairStats(playerId!, players, matches);

  // Prepare data for the table
  const tableData = pairStats.pairs.map((pair, index) => ({
    id: index,
    playerName: pair.playerName,
    percentTogether:
      pair.totalMatchesTogether > 0
        ? (
            (pair.totalMatchesTogether /
              (pair.totalMatchesTogether + pair.totalMatchesAgainst)) *
            100
          ).toFixed(1)
        : "0.0",
    winsTogether: pair.togetherStats.wins,
    percentWinsTogether: pair.togetherStats.winRate.toFixed(1),
    tiesTogether: pair.togetherStats.draws,
    percentTiesTogether: pair.togetherStats.drawRate.toFixed(1),
    lossesTogether: pair.togetherStats.losses,
    percentLossesTogether: pair.togetherStats.lossRate.toFixed(1),
    percentAgainst:
      pair.totalMatchesAgainst > 0
        ? (
            (pair.totalMatchesAgainst /
              (pair.totalMatchesTogether + pair.totalMatchesAgainst)) *
            100
          ).toFixed(1)
        : "0.0",
    winsAgainst: pair.againstStats.wins,
    percentWinsAgainst: pair.againstStats.winRate.toFixed(1),
    tiesAgainst: pair.againstStats.draws,
    percentTiesAgainst: pair.againstStats.drawRate.toFixed(1),
    lossesAgainst: pair.againstStats.losses,
    percentLossesAgainst: pair.againstStats.lossRate.toFixed(1),
  }));

  const columns: GridColDef[] = [
    {
      field: "playerName",
      headerName: "Jugador",
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{
            cursor: "pointer",
            color: "#1976d2",
            textDecoration: "underline",
          }}
          onClick={() => handlePlayerClick(params.value)}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentTogether",
      headerName: "%",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center" }}>{params.value}%</div>
      ),
    },
    {
      field: "winsTogether",
      headerName: "W",
      type: "number",
      width: 60,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{ textAlign: "center", color: "#4caf50", fontWeight: "bold" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentWinsTogether",
      headerName: "%W",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: "#4caf50" }}>
          {params.value}%
        </div>
      ),
    },
    {
      field: "tiesTogether",
      headerName: "D",
      type: "number",
      width: 60,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{ textAlign: "center", color: "#ff9800", fontWeight: "bold" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentTiesTogether",
      headerName: "%D",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: "#ff9800" }}>
          {params.value}%
        </div>
      ),
    },
    {
      field: "lossesTogether",
      headerName: "L",
      type: "number",
      width: 60,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{ textAlign: "center", color: "#f44336", fontWeight: "bold" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentLossesTogether",
      headerName: "%L",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: "#f44336" }}>
          {params.value}%
        </div>
      ),
    },
    {
      field: "percentAgainst",
      headerName: "%",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center" }}>{params.value}%</div>
      ),
    },
    {
      field: "winsAgainst",
      headerName: "W",
      type: "number",
      width: 60,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{ textAlign: "center", color: "#4caf50", fontWeight: "bold" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentWinsAgainst",
      headerName: "%W",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: "#4caf50" }}>
          {params.value}%
        </div>
      ),
    },
    {
      field: "tiesAgainst",
      headerName: "D",
      type: "number",
      width: 60,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{ textAlign: "center", color: "#ff9800", fontWeight: "bold" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentTiesAgainst",
      headerName: "%D",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: "#ff9800" }}>
          {params.value}%
        </div>
      ),
    },
    {
      field: "lossesAgainst",
      headerName: "L",
      type: "number",
      width: 60,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{ textAlign: "center", color: "#f44336", fontWeight: "bold" }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "percentLossesAgainst",
      headerName: "%L",
      type: "number",
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: "#f44336" }}>
          {params.value}%
        </div>
      ),
    },
  ];

  const columnGroupingModel: GridColumnGroupingModel = [
    {
      groupId: "together",
      headerName: "Al mateix equip",
      children: [
        { field: "percentTogether" },
        { field: "winsTogether" },
        { field: "percentWinsTogether" },
        { field: "tiesTogether" },
        { field: "percentTiesTogether" },
        { field: "lossesTogether" },
        { field: "percentLossesTogether" },
      ],
    },
    {
      groupId: "against",
      headerName: "En equips contraris",
      children: [
        { field: "percentAgainst" },
        { field: "winsAgainst" },
        { field: "percentWinsAgainst" },
        { field: "tiesAgainst" },
        { field: "percentTiesAgainst" },
        { field: "lossesAgainst" },
        { field: "percentLossesAgainst" },
      ],
    },
  ];

  return (
    <div className="player-page">
      <div className="player-header">
        <div className="player-title">
          <PlayerAvatar
            player={player}
            size={100}
            className="player-card-avatar"
          />
          <h1>{player.name}</h1>
        </div>
        <button className="back-button" onClick={() => window.history.back()}>
          ← Tornar
        </button>
      </div>

      <div className="player-content">
        <div className="player-overview">
          <div className="player-main-section">
            <div className="player-info-stats">
              <div className="basic-stats">
                <h3>Informació bàsica</h3>
                {player.matchStats && (
                  <>
                    <div className="stat-row">
                      <span className="stat-label">% Victòries:</span>
                      <span className="stat-value">
                        {player.matchStats.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Partits:</span>
                      <span className="stat-value">
                        {player.matchStats.totalMatches}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Ratxa:</span>
                      <span className="stat-value">
                        {player.currentStreak || "0"}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span 
                        className="stat-label" 
                        title="Estimació més probable de l'habilitat del jugador. Sol estar entre 15 i 40"
                      >
                        TrueSkill:
                      </span>
                      <span className="stat-value trueskill-value">
                        {(player.mu || TRUESKILL_CONSTANTS.DEFAULT_MU).toFixed(1)}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span 
                        className="stat-label"
                        title="Mitjana dels 5 atributs + TrueSkill / 5."
                      >
                        Mitjana + TS actual:
                      </span>
                      <span className="stat-value enhanced-avg-value">
                        {(player.enhancedAverage || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span 
                        className="stat-label"
                        title="Incertesa sobre l'habilitat. Tendeix a la baixa com més partits juga. Típicament entre 1 i 9"
                      >
                        TS Sigma (σ):
                      </span>
                      <span className="stat-value sigma-value">
                        {(player.sigma || TRUESKILL_CONSTANTS.DEFAULT_SIGMA).toFixed(2)}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span 
                        className="stat-label"
                        title="La mínima habilitat que el sistema està 99% segur que té aquest jugador (TS - 3σ)."
                      >
                        TS Conservador:
                      </span>
                      <span className="stat-value conservative-value">
                        {(player.conservativeRating || (player.mu || TRUESKILL_CONSTANTS.DEFAULT_MU) - 3 * TRUESKILL_CONSTANTS.DEFAULT_SIGMA).toFixed(1)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="attribute-stats">
                <h3>Estadístiques</h3>
                {renderStatRow(player.average, "Mitjana")}
                {renderStatRowWithTooltip(
                  player.enhancedAverage || 0, 
                  "Mitjana + TS",
                  "Mitjana tradicional amb bonus/penalització de TrueSkill"
                )}
                {renderStatRowWithTooltip(
                  player.mu || TRUESKILL_CONSTANTS.DEFAULT_MU,
                  "TrueSkill",
                  "Estimació de l'habilitat del jugador segons el sistema TrueSkill"
                )}
                {renderStatRow(player.attack, "ATK")}
                {renderStatRow(player.defense, "DEF")}
                {renderStatRow(player.physical, "FIS")}
                {renderStatRow(player.vision, "VIS")}
                {renderStatRow(player.technique, "TEC")}
              </div>
            </div>
          </div>

          {player.matchStats && (
            <div className="player-match-stats">
              <h2>Historial de partits</h2>
              <div className="match-stats-grid">
                <div className="match-stat-item">
                  <span className="stat-number wins">
                    {player.matchStats.wins}
                  </span>
                  <span className="stat-label">Victòries</span>
                </div>
                <div className="match-stat-item">
                  <span className="stat-number draws">
                    {player.matchStats.draws}
                  </span>
                  <span className="stat-label">Empats</span>
                </div>
                <div className="match-stat-item">
                  <span className="stat-number losses">
                    {player.matchStats.losses}
                  </span>
                  <span className="stat-label">Derrotes</span>
                </div>
              </div>

              {player.matchStats.allResults &&
                player.matchStats.allResults.length > 0 && (
                  <div className="all-results">
                    <h3>
                      Historial complet ({player.matchStats.allResults.length}{" "}
                      partits)
                    </h3>
                    <div className="results-list">
                      {player.matchStats.allResults.map(
                        (resultWithId, index) => {
                          return (
                            <div key={index} className="result-item">
                              <ClickableMatchResult
                                result={resultWithId.result}
                                matchId={resultWithId.MatchId}
                                navigate={navigate}
                                size="medium"
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {pairStats.pairs.length > 0 && (
            <div className="player-pair-stats">
              <h2>Estadístiques amb altres jugadors</h2>
              <div className="pair-stats-table">
                <DataGrid
                  rows={tableData}
                  columns={columns}
                  columnGroupingModel={columnGroupingModel}
                  getRowId={(row) => row.id}
                  initialState={{
                    sorting: {
                      sortModel: [{ field: "playerName", sort: "asc" }],
                    },
                  }}
                  disableColumnFilter
                  disableDensitySelector
                  disableRowSelectionOnClick
                  autoHeight={true}
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f4f4f4",
                      fontWeight: "bold",
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                    "& .MuiDataGrid-columnGroupHeader": {
                      backgroundColor: "#e3f2fd",
                      borderBottom: "1px solid #bbdefb",
                      fontWeight: "bold",
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
