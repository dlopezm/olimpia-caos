import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { sanityClient } from "../../sanity-client";
import { Player } from "../../data/players";

const getBackgroundColor = (value: number): string => {
  if (value >= 8) return "#e0f2f1";
  if (value >= 6) return "#e8f5e9";
  if (value >= 5) return "#fffde7";
  if (value >= 4) return "#fff3e0";
  return "#ffebee";
};

const renderStatCell = (value: number, decimals = 1) => (
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
    const fetchPlayers = async () => {
      const query = `*[_type == "player" && !isGuest]{
        _id,
        name,
        attack,
        defense,
        physical,
        vision,
        technique,
        "average": (attack + defense + physical + vision + technique) / 5
      }`;
      const data = await sanityClient.fetch(query);
      setPlayers(data);
    };

    fetchPlayers();
  }, []);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nom", width: 200 },
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
  ];

  return (
    <div style={{ height: "100%", width: "100%", padding: 20 }}>
      <DataGrid
        rows={players}
        columns={columns}
        getRowId={(row) => row._id}
        initialState={{
          sorting: {
            sortModel: [{ field: "average", sort: "desc" }],
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
