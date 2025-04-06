import { useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef, SortingState } from "@tanstack/react-table";
import { sanityClient } from "./sanity-client";
import "./PlayerList.css";

interface Player {
  _id: string;
  name: string;
  attack: number;
  defense: number;
  physical: number;
  vision: number;
  technique: number;
  average: number;
}

export const PlayerList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const query = `*[_type == "player"]{
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

  const columns: ColumnDef<Player>[] = [
    { accessorKey: "name", header: "Nom" },
    { accessorKey: "attack", header: "ATK" },
    { accessorKey: "defense", header: "DEF" },
    { accessorKey: "physical", header: "FIS" },
    { accessorKey: "vision", header: "VIS" },
    { accessorKey: "technique", header: "TEC" },
    {
      accessorKey: "average",
      header: "Mitjana",
      cell: (info) => Number(info.getValue()).toFixed(2),
    },
  ];

  const table = useReactTable({
    data: players,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });

  return (
    <div className="player-list-page">
      <h3>Llista de jugadors</h3>
      <table className="player-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === "asc" && " ▲"}
                  {header.column.getIsSorted() === "desc" && " ▼"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
