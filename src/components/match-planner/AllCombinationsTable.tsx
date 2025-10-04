import { useMemo, useState } from "react";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { FaClipboardCheck, FaRegClipboard } from "react-icons/fa6";
import { Player } from "../../data/players";
import {
  formatTeamNames,
  formatTeamForSharing,
  calculateTeamEnhancedAverage,
  calculateTeamTrueSkillAverage,
  getGradientColor,
} from "../../utils/team-utils";
import "./AllCombinationsTable.css";

interface TeamCombination {
  team1: Player[];
  team2: Player[];
  trueSkillDiff: number;
  enhancedAvgDiff: number;
  avgDiff: number;
}

interface AllCombinationsTableProps {
  combinations: TeamCombination[];
  onClose: () => void;
}

export const AllCombinationsTable = ({
  combinations,
  onClose,
}: AllCombinationsTableProps) => {
  const [selectedCombinations, setSelectedCombinations] = useState<Set<number>>(
    new Set(),
  );
  const [copied, setCopied] = useState(false);

  // Calculates how many players switched teams between combinations
  const calculateTeamChanges = (
    combo1: TeamCombination,
    combo2: TeamCombination,
  ): number => {
    const combo1Team1Ids = new Set(combo1.team1.map((p) => p._id));
    const combo1Team2Ids = new Set(combo1.team2.map((p) => p._id));
    const combo2Team1Ids = new Set(combo2.team1.map((p) => p._id));
    const combo2Team2Ids = new Set(combo2.team2.map((p) => p._id));

    let changedPlayers = 0;

    for (const playerId of combo1Team1Ids) {
      if (combo2Team2Ids.has(playerId)) {
        changedPlayers++;
      }
    }

    for (const playerId of combo1Team2Ids) {
      if (combo2Team1Ids.has(playerId)) {
        changedPlayers++;
      }
    }

    return changedPlayers;
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedCombinations);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedCombinations(newSelected);
  };

  const formatSelectedCombinations = (): string => {
    if (selectedCombinations.size === 0) return "";

    const selectedCombos = Array.from(selectedCombinations)
      .map((index) => combinations[index])
      .map((combination, idx) => {
        // Generate URL for this specific team combination
        const shortId = (player: Player) => player._id.slice(0, 5);
        const lightIds = combination.team1.map(shortId);
        const darkIds = combination.team2.map(shortId);

        const params = new URLSearchParams();
        if (lightIds.length > 0) params.set("light", lightIds.join(","));
        if (darkIds.length > 0) params.set("dark", darkIds.join(","));

        const combinationUrl = `${window.location.origin}/match-planner?${params.toString()}`;

        return [
          `=== Combinació ${idx + 1} ===`,
          formatTeamForSharing(combination.team1, "▫️"),
          formatTeamForSharing(combination.team2, "◾️"),
          combinationUrl,
          "",
        ].join("\n");
      });

    return selectedCombos.join("\n");
  };

  const handleCopySelected = () => {
    const textToCopy = formatSelectedCombinations();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rows = useMemo(() => {
    // Only show combinations with >2 team changes from ALL selected combinations
    const shouldShow = (
      combination: TeamCombination,
      index: number,
    ): boolean => {
      if (selectedCombinations.size === 0) return true;
      if (selectedCombinations.has(index)) return true;

      for (const selectedIndex of selectedCombinations) {
        const selectedCombo = combinations[selectedIndex];
        const teamChanges = calculateTeamChanges(combination, selectedCombo);

        if (teamChanges <= 2) {
          return false;
        }
      }
      return true;
    };

    const allTransformedRows = combinations.map((combination, index) => ({
      id: index,
      team1Names: formatTeamNames(combination.team1),
      team2Names: formatTeamNames(combination.team2),
      trueSkillDiff: Math.abs(combination.trueSkillDiff),
      enhancedAvgDiff: Math.abs(combination.enhancedAvgDiff),
      team1TrueSkill: calculateTeamTrueSkillAverage(combination.team1),
      team2TrueSkill: calculateTeamTrueSkillAverage(combination.team2),
      team1EnhancedAvg: calculateTeamEnhancedAverage(combination.team1),
      team2EnhancedAvg: calculateTeamEnhancedAverage(combination.team2),
      _combination: combination,
    }));

    return allTransformedRows.filter((_, index) =>
      shouldShow(combinations[index], index),
    );
  }, [combinations, selectedCombinations]);

  const columns: GridColDef[] = [
    {
      field: "selected",
      headerName: "☑️",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={selectedCombinations.has(params.row.id)}
          onChange={(e) =>
            handleCheckboxChange(params.row.id, e.target.checked)
          }
          style={{
            transform: "scale(1.2)",
            cursor: "pointer",
          }}
        />
      ),
    },
    {
      field: "team1Names",
      headerName: "Equip ◻️",
      width: 460,
      sortable: false,
    },
    {
      field: "team2Names",
      headerName: "Equip ◼️",
      width: 460,
      sortable: false,
    },
    {
      field: "team1TrueSkill",
      headerName: "TS ◻️",
      width: 120,
      type: "number",
      valueFormatter: (value) => Number(value).toFixed(2),
      cellClassName: (params) => {
        return params.row.team1TrueSkill > params.row.team2TrueSkill
          ? "advantage-cell"
          : "disadvantage-cell";
      },
    },
    {
      field: "team2TrueSkill",
      headerName: "TS ◼️",
      width: 120,
      type: "number",
      valueFormatter: (value) => Number(value).toFixed(2),
      cellClassName: (params) => {
        return params.row.team2TrueSkill > params.row.team1TrueSkill
          ? "advantage-cell"
          : "disadvantage-cell";
      },
    },
    {
      field: "trueSkillDiff",
      headerName: "Diff TS",
      width: 120,
      type: "number",
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: getGradientColor(params.value, 3.5),
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            color: params.value > 1.75 ? "white" : "black",
          }}
        >
          {Number(params.value).toFixed(2)}
        </div>
      ),
    },
    {
      field: "team1EnhancedAvg",
      headerName: "Mitja ◻️",
      width: 140,
      type: "number",
      valueFormatter: (value) => Number(value).toFixed(2),
      cellClassName: (params) => {
        return params.row.team1EnhancedAvg > params.row.team2EnhancedAvg
          ? "advantage-cell"
          : "disadvantage-cell";
      },
    },
    {
      field: "team2EnhancedAvg",
      headerName: "Mitja ◼️",
      width: 140,
      type: "number",
      valueFormatter: (value) => Number(value).toFixed(2),
      cellClassName: (params) => {
        return params.row.team2EnhancedAvg > params.row.team1EnhancedAvg
          ? "advantage-cell"
          : "disadvantage-cell";
      },
    },
    {
      field: "enhancedAvgDiff",
      headerName: "Diff Mitja",
      width: 140,
      type: "number",
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: getGradientColor(params.value, 0.4),
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            color: params.value > 0.2 ? "white" : "black",
          }}
        >
          {Number(params.value).toFixed(2)}
        </div>
      ),
    },
  ];

  const handleRowClick = (params: GridRowParams) => {
    const combination = params.row._combination;
    console.log(`=== Combination ${params.row.id} (Click Debug) ===`);
    console.log(
      "Team 1:",
      combination.team1.map((p: Player) => p.name),
    );
    console.log(
      "Team 2:",
      combination.team2.map((p: Player) => p.name),
    );
    console.log("Pre-calculated differences:");
    console.log("  TrueSkill:", combination.trueSkillDiff);
    console.log("  Enhanced Avg:", combination.enhancedAvgDiff);
  };

  return (
    <div className="combinations-fullscreen">
      <div className="combinations-header-fullscreen">
        <div>
          <h2>
            Totes les Combinacions Possibles ({rows.length}/
            {combinations.length})
          </h2>
          {selectedCombinations.size > 0 && (
            <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#666" }}>
              {selectedCombinations.size} combinacions seleccionades · Mostrant
              combinacions amb &gt;2 canvis d'equip
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {selectedCombinations.size > 0 && (
            <button
              onClick={handleCopySelected}
              className="copy-button-fullscreen"
              title="Copia les combinacions seleccionades"
            >
              {copied ? (
                <>
                  <FaClipboardCheck /> Copiat!
                </>
              ) : (
                <>
                  <FaRegClipboard /> Copia
                </>
              )}
            </button>
          )}
          <button className="close-button-fullscreen" onClick={onClose}>
            ✕ Tanca
          </button>
        </div>
      </div>

      <div className="combinations-table-fullscreen">
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            sorting: {
              sortModel: [{ field: "enhancedAvgDiff", sort: "asc" }],
            },
          }}
          onRowClick={handleRowClick}
          disableColumnFilter
          disableDensitySelector
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            height: "100%",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f1f3f4",
              fontWeight: "bold",
              fontSize: "0.9rem",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.85rem",
            },
            "& .balanced-cell": {
              backgroundColor: "#e8f5e8",
              color: "#2e7d32",
              fontWeight: "bold",
            },
            "& .unbalanced-cell": {
              backgroundColor: "#ffebee",
              color: "#d32f2f",
              fontWeight: "bold",
            },
            "& .advantage-cell": {
              backgroundColor: "rgba(76, 175, 80, 0.1)",
            },
            "& .disadvantage-cell": {
              backgroundColor: "rgba(244, 67, 54, 0.1)",
            },
          }}
        />
      </div>
    </div>
  );
};
