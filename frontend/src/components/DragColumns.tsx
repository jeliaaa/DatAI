import { useEffect, useState } from "react";
import { listColumns } from "../api";
import PreviewCard from "./PreviewCard";
import type { TableRow, DragColumnsProps } from "../types";

export default function DragColumns({ table, previewRows, onBuild }: DragColumnsProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
  async function loadCols() {
    if (!table) {
      setColumns([]);
      setSelected([]);
      return;
    }
    try {
      const res = await listColumns(table);
      setColumns(res.columns || []);
      setSelected([]); // reset selected after loading new columns
    } catch {
      setColumns([]);
      setSelected([]);
    }
  }
  loadCols();
}, [table]);

  function toggle(col: string) {
    setSelected(s => s.includes(col) ? s.filter(x => x !== col) : [...s, col]);
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium mb-2">Columns</h4>
        <div className="flex flex-wrap gap-2">
          {columns.map(c => (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`px-2 py-1 rounded ${selected.includes(c) ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <button
            disabled={selected.length === 0}
            onClick={() => onBuild(selected)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Build Table ({selected.length})
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Preview (first rows)</h4>
        <PreviewCard rows={convertPreview(previewRows)} />
      </div>
    </div>
  );
}

function convertPreview(rows: TableRow[]): TableRow[] {
  if (!rows || rows.length === 0) return [];

  // If rows are arrays instead of objects
  if (Array.isArray(rows[0])) {
    return (rows as unknown as (string | number | boolean)[][]).map(r => {
      const obj: TableRow = {};
      r.forEach((v, i) => {
        obj[`c${i}`] = v;
      });
      return obj;
    });
  }

  // Already TableRow[]
  return rows;
}
