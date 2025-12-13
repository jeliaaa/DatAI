import type { TableRow } from "../types";

export default function TableBuilder({ rows }: { rows: TableRow[] }) {
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-500">No built table yet</div>;
  const cols = Object.keys(rows[0] || {});
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-medium mb-2">Built Table</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {cols.map(c => <th key={c} className="px-2 py-2 text-left border-b">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {cols.map(c => <td key={c} className="px-2 py-2 border-b">{String((r as TableRow)[c] ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <button onClick={() => downloadJSON(rows)} className="px-3 py-1 bg-blue-600 text-white rounded">Download JSON</button>
        <button onClick={() => downloadCSV(rows)} className="ml-2 px-3 py-1 bg-gray-700 text-white rounded">Download CSV</button>
      </div>
    </div>
  );
}

function downloadJSON(rows: TableRow[]) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows: TableRow[]) {
  if (!rows || rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(",")].concat(rows.map(r => cols.map(c => JSON.stringify((r as TableRow)[c] ?? "")).join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.csv";
  a.click();
  URL.revokeObjectURL(url);
}
