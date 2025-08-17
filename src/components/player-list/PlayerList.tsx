import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { sanityClient } from "../../sanity-client";
import { Player } from "../../data/players";
import { allPlayersQuery, allMatchesQuery } from "../../data-utils";
import { updatePlayersWithTrueSkill, calculateEnhancedAverage, calculateTrueSkillRatings } from "../../trueskill-utils";
import { TRUESKILL_CONSTANTS } from "../../constants";

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
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both players and matches
      const [data, matchesData] = await Promise.all([
        sanityClient.fetch(allPlayersQuery(false)),
        sanityClient.fetch(allMatchesQuery)
      ]);

      // Calculate TrueSkill ratings first
      calculateTrueSkillRatings(matchesData);

      const playersWithTrueSkill = updatePlayersWithTrueSkill(data);
      // Pre-calculate enhanced averages to avoid recalculation on every render
      const playersWithEnhancedAverages = playersWithTrueSkill.map(player => ({
        ...player,
        enhancedAverage: calculateEnhancedAverage(player)
      }));
      setPlayers(playersWithEnhancedAverages);
    };

    fetchData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nom",
      width: 200,
      renderCell: (params) => (
        <span style={{ color: "var(--color-text)" }}>{params.value}</span>
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
      field: "mu",
      headerName: "TS",
      type: "number",
      width: 120,
      renderCell: (params) => renderStatCell(params.value || TRUESKILL_CONSTANTS.DEFAULT_MU, 1),
    },
    {
      field: "average",
      headerName: "Mitjana",
      type: "number",
      width: 150,
      renderCell: (params) => renderStatCell(params.value),
    },
    {
      field: "enhancedAverage",
      headerName: "Mitjana + TS",
      type: "number",
      width: 150,
      renderCell: (params) => renderStatCell(params.value, 2),
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
