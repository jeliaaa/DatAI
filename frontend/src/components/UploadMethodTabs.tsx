type Props = {
  method: string;
  setMethod: (m: string) => void;
};

export default function UploadMethodTabs({ method, setMethod }: Props) {
  const methods = [
    { id: "file", label: "Upload File" },
    { id: "sql", label: "Upload SQL Dump" },
    { id: "url", label: "Connect DB (URL)" },
  ];
  return (
    <div className="flex gap-2">
      {methods.map(m => (
        <button key={m.id} onClick={() => setMethod(m.id)} className={`px-3 py-1 rounded ${method === m.id ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
