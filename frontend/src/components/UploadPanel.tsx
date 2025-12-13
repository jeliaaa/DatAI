import { useState } from "react";
import UploadMethodTabs from "./UploadMethodTabs";
import { uploadFile, connectDb, uploadSql } from "../api";

export default function UploadPanel({ onUploaded }: { onUploaded?: () => void }) {
  const [method, setMethod] = useState<string>("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");

  async function handleFileUpload() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await uploadFile(fd);
    setFile(null);
    if (onUploaded) onUploaded();
  }

  async function handleSqlUpload() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await uploadSql(fd);
    setFile(null);
    if (onUploaded) onUploaded();
  }

  async function handleConnect() {
    if (!url) return;
    await connectDb(url);
    if (onUploaded) onUploaded();
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="font-medium">Upload / Connect</h2>
        <UploadMethodTabs method={method} setMethod={setMethod} />
      </div>

      {method === "file" && (
        <div className="mt-4">
          <div className="border-2 border-dashed p-6 text-center rounded">
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <p className="text-sm text-gray-500 mt-2">Supported: .csv .xlsx .json</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button disabled={!file} onClick={() => handleFileUpload()} className="px-4 py-2 bg-blue-600 text-white rounded">Upload</button>
          </div>
        </div>
      )}

      {method === "sql" && (
        <div className="mt-4">
          <div className="border-2 border-dashed p-6 text-center rounded">
            <input type="file" accept=".sql" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <p className="text-sm text-gray-500 mt-2">Upload SQL dump (.sql)</p>
          </div>
          <div className="mt-3">
            <button disabled={!file} onClick={handleSqlUpload} className="px-4 py-2 bg-blue-600 text-white rounded">Upload SQL</button>
          </div>
        </div>
      )}

      {method === "url" && (
        <div className="mt-4">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="postgresql://user:pass@host:5432/db" className="w-full p-2 border rounded" />
          <div className="mt-3">
            <button disabled={!url} onClick={handleConnect} className="px-4 py-2 bg-blue-600 text-white rounded">Connect</button>
          </div>
        </div>
      )}
    </div>
  );
}
