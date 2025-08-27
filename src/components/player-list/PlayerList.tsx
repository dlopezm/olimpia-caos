import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { TRUESKILL_CONSTANTS } from "../../constants";
import { MatchOutcomeLetter } from "../../types/match";
import { useData } from "../../stores/DataStore";

const getBackgroundColor = (value: number): string => {
  if (value >= 4.25) return "#e0f2f1";
  if (value >= 3.75) return "#e8f5e9";
  if (value >= 3) return "#fffde7";
  if (value >= 2.25) return "#fff3e0";
  return "#ffebee";
};

const renderStatCell = (value: number, decimals = 2) => (
  <div
    style={{
      backgroundColor: getBackgroundColor(value),
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {value.toFixed(decimals)}
  </div>
);

export const PlayerList = () => {
  const { getNonGuestPlayers, loading, error } = useData();
  const players = getNonGuestPlayers();
  const navigate = useNavigate();

  if (loading) {
    return <div>Carregant dades...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handlePlayerClick = (playerId: string) => {
    navigate(`/jugador/${playerId}`);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nom",
      width: 200,
      renderCell: (params) => (
        <span 
          style={{ 
            color: "var(--color-text)",
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight: "500"
          }}
          onClick={() => handlePlayerClick(params.row._id)}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "attack",
      headerName: "ATK",
      type: "number",
      width: 120,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "defense",
      headerName: "DEF",
      type: "number",
      width: 120,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "physical",
      headerName: "FIS",
      type: "number",
      width: 120,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "vision",
      headerName: "VIS",
      type: "number",
      width: 120,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "technique",
      headerName: "TEC",
      type: "number",
      width: 120,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "average",
      headerName: "Mitjana",
      type: "number",
      width: 150,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "mu",
      headerName: "TrueSkill",
      type: "number",
      width: 120,
      renderCell: (params) =>
        renderStatCell(params.value || TRUESKILL_CONSTANTS.DEFAULT_MU, 1),
    },
    {
      field: "enhancedAverage",
      headerName: "Mitjana + TS",
      type: "number",
      width: 150,
      renderCell: (params) => renderStatCell(params.value, 2),
    },
    {
      field: "winRate",
      headerName: "% victòries",
      type: "number",
      width: 100,
      renderCell: (params) => (
        <div className="stat-cell">{params.value.toFixed(1)}%</div>
      ),
    },
    {
      field: "last5Results",
      headerName: "5 últims",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const stats = params.row.matchStats;
        if (!stats || !stats.allResults || stats.allResults.length === 0) {
          return <div className="stat-cell">-</div>;
        }
        
        // Derive last 5 results from the full list
        const last5Results = stats.allResults.slice(-5);
        
        return (
          <div className="stat-cell" style={{ display: "flex", gap: "2px" }}>
            {last5Results.map(
              (result: MatchOutcomeLetter, index: number) => (
                <span
                  key={index}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor:
                      result === "W"
                        ? "#4caf50"
                        : result === "D"
                          ? "#ff9800"
                          : "#f44336",
                  }}
                >
                  {result}
                </span>
              ),
            )}
          </div>
        );
      },
    },
    {
      field: "currentStreak",
      headerName: "Ratxa",
      width: 80,
      sortComparator: (v1, v2) => {
        // Handle empty/zero values
        if (v1 === "0" || v1 === "-") return 1;
        if (v2 === "0" || v2 === "-") return -1;
        
        // Parse streak values (e.g., "9W", "5D", "1L")
        const parseStreak = (streak: string) => {
          const match = streak.match(/^(\d+)([WDL])$/);
          if (!match) return { count: 0, type: 'L' as const };
          const count = parseInt(match[1]);
          const type = match[2] as 'W' | 'D' | 'L';
          return { count, type };
        };
        
        const s1 = parseStreak(v1);
        const s2 = parseStreak(v2);
        
        // Sort by type first (W > D > L)
        const typeOrder: Record<'W' | 'D' | 'L', number> = { 'W': 1, 'D': 2, 'L': 3 };
        const typeDiff = typeOrder[s1.type] - typeOrder[s2.type];
        
        if (typeDiff !== 0) return typeDiff;
        
        // For wins and draws: higher count first
        // For losses: lower count first (fewer losses is better)
        if (s1.type === 'L') {
          return s1.count - s2.count; // Lower losses first
        } else {
          return s2.count - s1.count; // Higher wins/draws first
        }
      },
      renderCell: (params) => {
        if (params.value === "0") {
          return <div className="stat-cell">-</div>;
        }
        
        // Parse the streak to get color
        const match = params.value.match(/^(\d+)([WDL])$/);
        let color = "#666"; // default gray
        if (match) {
          const type = match[2];
          color = type === 'W' ? '#4caf50' : type === 'D' ? '#ff9800' : '#f44336';
        }
        
        return (
          <div className="stat-cell" style={{ color, fontWeight: 'bold' }}>
            {params.value}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ height: "100%", width: "100%", padding: 20 }}>
      <DataGrid
        rows={players}
        columns={columns}
        getRowId={(row) => row._id}
        initialState={{
          sorting: {
            sortModel: [{ field: "enhancedAverage", sort: "desc" }],
          },
        }}
        disableColumnFilter
        disableDensitySelector
        disableRowSelectionOnClick
        autoHeight={false}
        sx={{
          height: "calc(100% - 50px)",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f4f4f4",
            fontWeight: "bold",
          },
        }}
      />
    </div>
  );
};
