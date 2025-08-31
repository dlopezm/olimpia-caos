import React, { useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useData } from "../../stores/DataStore";
import {
  getAllPlayerTrueSkillFromSnapshot,
  calculateEnhancedAverage,
} from "../../trueskill-utils";
import "./TrueSkillChart.css";

interface PlayerSeries {
  name: string;
  data: [number, number][];
  visible: boolean;
  matchesPlayed: number;
  participationRate: number;
}

export const TrueSkillChart: React.FC = () => {
  const { matches, players, loading, error } = useData();

  // Legend control state
  const [showLegend, setShowLegend] = useState(true);

  // Metric selection state
  const [selectedMetric, setSelectedMetric] = useState<
    "trueskill" | "enhanced" | "winrate"
  >("trueskill");

  // Prepare Highcharts configuration
  const chartOptions = useMemo(() => {
    if (!matches.length || !players.length) return null;

    // Sort matches by date
    const sortedMatches = [...matches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate player participation and create series data
    const nonGuestPlayers = players.filter((p) => !p.isGuest);
    const totalMatches = matches.length;
    const series: PlayerSeries[] = [];

    nonGuestPlayers.forEach((player) => {
      // Count matches where this player participated
      const matchesPlayed = matches.filter(
        (match) =>
          match.localTeam.some((p) => p._id === player._id) ||
          match.awayTeam.some((p) => p._id === player._id),
      ).length;

      const participationRate =
        totalMatches > 0 ? matchesPlayed / totalMatches : 0;

      // Build data points for this player
      const playerData: [number, number][] = [];

      if (selectedMetric === "winrate") {
        // Calculate cumulative win rate for W/D/L metric
        let totalPlayerMatches = 0;
        let totalWins = 0;

        sortedMatches.forEach((match) => {
          const isInLocalTeam = match.localTeam.some(
            (p) => p._id === player._id,
          );
          const isInAwayTeam = match.awayTeam.some((p) => p._id === player._id);

          if (isInLocalTeam || isInAwayTeam) {
            totalPlayerMatches++;

            // Determine match outcome for this player
            if (
              (isInLocalTeam && match.result === "white") ||
              (isInAwayTeam && match.result === "dark")
            ) {
              totalWins++;
            }
            // Losses don't need explicit tracking (totalPlayerMatches - wins - draws)

            // Calculate win rate (wins + 0.5*draws) / total matches * 100
            const winRate =
              totalPlayerMatches > 0
                ? (totalWins / totalPlayerMatches) * 100
                : 0;

            const timestamp = new Date(match.date).getTime();
            playerData.push([timestamp, Number(winRate.toFixed(1))]);
          }
        });
      } else {
        // TrueSkill and Enhanced Average metrics
        sortedMatches.forEach((match) => {
          if (!match.playerTSSnapshot) return;

          const snapshot = getAllPlayerTrueSkillFromSnapshot(match);
          const playerTrueSkill = snapshot.get(player._id);

          if (playerTrueSkill) {
            const timestamp = new Date(match.date).getTime();
            let value: number;

            if (selectedMetric === "trueskill") {
              value = Number(playerTrueSkill.mu.toFixed(1));
            } else {
              // Calculate enhanced average from TrueSkill data
              const tempPlayer = {
                ...player,
                mu: playerTrueSkill.mu,
                sigma: playerTrueSkill.sigma,
              };
              value = Number(calculateEnhancedAverage(tempPlayer).toFixed(2));
            }

            playerData.push([timestamp, value]);
          }
        });
      }

      if (playerData.length > 0) {
        series.push({
          name: `${player.name} (${matchesPlayed} jugats)`,
          data: playerData,
          visible: participationRate >= 0.3, // Default visible for ≥30% participation
          matchesPlayed,
          participationRate,
        });
      }
    });

    // Sort series by participation rate (highest first)
    series.sort((a, b) => b.participationRate - a.participationRate);

    const options: Highcharts.Options = {
      chart: {
        type: "line",
        height: 550,
        backgroundColor: "#ffffff",
        marginRight: 20,
        marginBottom: 180,
        style: {
          fontFamily: "inherit",
        },
      },
      title: {
        text:
          selectedMetric === "trueskill"
            ? "TrueSkill"
            : selectedMetric === "enhanced"
              ? "Mitjana + TS"
              : "% de Victòries",
        style: {
          fontSize: "24px",
          fontWeight: "bold",
        },
      },
      subtitle: {
        text: "Clica a la llegenda per mostrar/amagar jugadors",
      },
              xAxis: {
          type: "datetime",
          title: {
            text: "Data",
          },
          dateTimeLabelFormats: {
            day: "%d/%m",
            month: "%m/%Y",
          },
          plotLines: [
            {
              value: new Date("2025-08-21").getTime(), // Day before 22/08/2025
              color: "#2196F3",
              dashStyle: "Dash",
              width: 2,
              label: {
                text: "TrueSkill introduït",
                align: "right",
                rotation: -90,
                verticalAlign: "middle",
                style: {
                  color: "#2196F3",
                  fontWeight: "bold",
                  fontSize: "12px",
                },
                x: -10,
                y: 0,
              },
              zIndex: 5,
            },
          ],
        },
      yAxis: {
        title: {
          text:
            selectedMetric === "trueskill"
              ? "TrueSkill (μ)"
              : selectedMetric === "enhanced"
                ? "Mitjana + TS"
                : "% Victòries (W + 0.5×D)",
        },
        plotLines: [
          {
            value:
              selectedMetric === "trueskill"
                ? 25
                : selectedMetric === "enhanced"
                  ? 3.5
                  : 50,
            color: "#ff0000",
            dashStyle: "ShortDash",
            width: 1,
            label: {
              text:
                selectedMetric === "trueskill"
                  ? "TrueSkill per defecte (25.0)"
                  : selectedMetric === "enhanced"
                    ? "Mitjana per defecte (~3.5)"
                    : "Equilibri (50%)",
              align: "right",
              style: {
                color: "#666666",
              },
            },
          },
        ],
        // Explicitly set y-axis configuration for each metric
        ...(selectedMetric === "winrate" 
          ? {
              min: 0,
              max: 100,
              tickInterval: 10,
            }
          : {
              min: undefined, // Auto-scale
              max: undefined, // Auto-scale
              tickInterval: undefined, // Auto-scale
            }),
      },
      tooltip: {
        shared: false,
        formatter: function () {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const point = this as any;
          const metricLabel =
            selectedMetric === "trueskill"
              ? "TrueSkill"
              : selectedMetric === "enhanced"
                ? "Mitjana + TS"
                : "% Victòries";
          const precision =
            selectedMetric === "trueskill"
              ? 1
              : selectedMetric === "enhanced"
                ? 2
                : 1;
          const suffix = selectedMetric === "winrate" ? "%" : "";
          return `<b>${point.series.name.split(" (")[0]}</b><br/>
                  Data: ${Highcharts.dateFormat("%d/%m/%Y", point.x)}<br/>
                  ${metricLabel}: ${point.y.toFixed(precision)}${suffix}`;
        },
      },
      legend: {
        enabled: showLegend,
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        x: 0,
        y: 0,
        floating: false,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderWidth: 1,
        borderRadius: 5,
        shadow: true,
        maxHeight: 140,
        width: undefined,
        itemMarginTop: 5,
        itemMarginBottom: 5,
        navigation: {
          activeColor: "#3E576F",
          inactiveColor: "#CCC",
        },
        itemStyle: {
          fontSize: "10px",
          fontWeight: "normal",
          textOverflow: "ellipsis",
        },
        itemHoverStyle: {
          color: "#000",
        },
        itemHiddenStyle: {
          color: "#CCC",
        },
      },
      plotOptions: {
        line: {
          lineWidth: 2,
          marker: {
            radius: 4,
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 6,
              },
            },
          },
          states: {
            hover: {
              lineWidth: 3,
            },
          },
        },
        series: {
          connectNulls: false,
        },
      },
      series: series.map((s, index) => ({
        type: "line" as const,
        name: s.name,
        data: s.data,
        visible: s.visible,
        color: `hsl(${((index * 360) / series.length) % 360}, 70%, 50%)`, // Generate distinct colors
      })),
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 768,
            },
            chartOptions: {
              chart: {
                marginRight: 20, // Reduced margin for mobile
                height: 500,
              },
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
                x: 0,
                y: 20,
                floating: false,
                maxHeight: 150,
                itemStyle: {
                  fontSize: "10px",
                },
              },
            },
          },
        ],
      },
    };

    return options;
  }, [matches, players, selectedMetric, showLegend]);

  if (loading) {
    return <div className="loading">Carregant dades...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!chartOptions) {
    return (
      <div className="no-data">
        No hi ha dades suficients per mostrar el gràfic.
      </div>
    );
  }

  return (
    <div className="trueskill-chart">
      <div className="chart-controls">
        <div className="metric-controls">
          <span>Mètrica:</span>
          <label className="control-group">
            <input
              type="radio"
              name="metric"
              value="trueskill"
              checked={selectedMetric === "trueskill"}
              onChange={() => setSelectedMetric("trueskill")}
            />
            <span>TrueSkill</span>
          </label>
          <label className="control-group">
            <input
              type="radio"
              name="metric"
              value="enhanced"
              checked={selectedMetric === "enhanced"}
              onChange={() => setSelectedMetric("enhanced")}
            />
            <span>Mitjana + TS</span>
          </label>
          <label className="control-group">
            <input
              type="radio"
              name="metric"
              value="winrate"
              checked={selectedMetric === "winrate"}
              onChange={() => setSelectedMetric("winrate")}
            />
            <span>% Victòries</span>
          </label>
        </div>

        <div className="legend-controls">
          <label className="control-group">
            <input
              type="checkbox"
              checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)}
            />
            <span>Mostrar llegenda</span>
          </label>
        </div>
      </div>

      <div className="chart-container">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </div>
  );
};
