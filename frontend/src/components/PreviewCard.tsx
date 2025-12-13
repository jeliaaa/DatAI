import type { TableRow } from "../types";

export default function PreviewCard({ rows }: { rows: TableRow[] }) {
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-500">No preview available</div>;

  const cols = Object.keys(rows[0] || {});
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {cols.map(c => <th key={c} className="px-2 py-1 text-left">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((r, i) => (
            <tr key={i}>
              {cols.map(c => <td key={c} className="px-2 py-1">{String((r as TableRow)[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
