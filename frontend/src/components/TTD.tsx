import { useEffect, useState } from "react";
import UploadPanel from "../components/UploadPanel";
import DragColumns from "../components/DragColumns";
import TableBuilder from "../components/TableBuilder";
import { listTables, preview, transform } from "../api";
import type { ListTablesResponse, PreviewResponse, TransformResponse, TableRow } from "../types";

export default function TTD() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<TableRow[]>([]);
  const [builtRows, setBuiltRows] = useState<TableRow[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res: ListTablesResponse = await listTables();
        setTables(res.tables || []);
        if (res.tables && res.tables.length > 0) {
          setSelectedTable(res.tables[0]);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.warn("No backend or no dataset yet:", e.message);
        } else {
          console.warn("No backend or no dataset yet:", e);
        }
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadPreview() {
      if (!selectedTable) return;
      const res: PreviewResponse = await preview(selectedTable, 50);
      setPreviewRows(res.rows || []);
    }
    loadPreview();
  }, [selectedTable]);

  async function handleBuild(cols: string[]) {
    if (!selectedTable) return;
    const res: TransformResponse = await transform(selectedTable, cols);
    setBuiltRows(res.rows || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">DataPromptor</h1>
          <p className="text-sm text-gray-500">
            Upload data (CSV/Excel/JSON/SQL) or connect a database — then drag columns to build a table.
          </p>
        </header>

        <UploadPanel onUploaded={() => {
          listTables().then(r => setTables(r.tables || []));
        }} />

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="col-span-1 bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Tables</h3>
            <ul>
              {tables.map(t => (
                <li
                  key={t}
                  className={`py-1 cursor-pointer ${t === selectedTable ? "font-semibold" : ""}`}
                  onClick={() => setSelectedTable(t)}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Schema & Build</h3>
            <DragColumns table={selectedTable} previewRows={previewRows} onBuild={handleBuild} />
          </div>
        </div>

        <div className="mt-6">
          <TableBuilder rows={builtRows} />
        </div>
      </div>
    </div>
  );
}
