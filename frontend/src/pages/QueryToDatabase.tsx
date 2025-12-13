import React, { useState, useEffect } from "react";
import { Plus, X, Database as DatabaseIcon, Send, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../components/UI/PageHeader";
import DatabaseModal from "../components/DatabaseModal";
import { useDbStore}  from "../stores/dbStore";
import {type DBResult, type SQLResult, type MongoResult } from "../types"
const QueryToDatabase: React.FC = () => {
  const { databases, setDatabases, prompt, setPrompt, results, setResults, loading, queryAllDatabases } = useDbStore();
  const [showModal, setShowModal] = useState(false);
  const [openIds, setOpenIds] = useState<number[]>([]);

  // Restore from localStorage
  useEffect(() => {
    const savedDbs = localStorage.getItem("databases");
    if (savedDbs) setDatabases(JSON.parse(savedDbs));

    const savedResults = localStorage.getItem("results");
    if (savedResults) setResults(JSON.parse(savedResults));
  }, [setDatabases, setResults]);

  const handleRemoveDatabase = (id: number) => {
    const updatedDbs = databases.filter((db) => db.id !== id);
    const updatedResults = results.filter((r) => r.db.id !== id);
    setDatabases(updatedDbs);
    setResults(updatedResults);
    localStorage.setItem("databases", JSON.stringify(updatedDbs));
    localStorage.setItem("results", JSON.stringify(updatedResults));
  };

  const handleSendQuery = async () => {
    if (!prompt.trim() || databases.length === 0) return;

    try {
      const queryResults = await queryAllDatabases();
      setResults(queryResults);
      toast.success("Query executed on all databases!");
      console.log("Query results:", queryResults);
    } catch (err) {
      toast.error("Failed to execute query.");
      console.error(err);
    }
  };

  const toggleAccordion = (id: number) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderResult = (res: DBResult) => {
    if (!res.result) return null;

    // MongoResult
    if (!Array.isArray(res.result)) {
      const mongoResult = res.result as MongoResult;
      return Object.entries(mongoResult).map(([collection, rows]) => (
        <div key={collection} className="mb-4">
          <h4 className="font-semibold">{collection}</h4>
          {rows.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg mt-2">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(rows[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50">
                      {Object.values(row).map((val, vIdx) => (
                        <td key={vIdx} className="px-4 py-2 text-sm border-b">{typeof val === "object" ? JSON.stringify(val) : String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data found in collection.</p>
          )}
        </div>
      ));
    }

    // SQLResult
    const sqlResult = res.result as SQLResult;
    return sqlResult.length > 0 ? (
      <div className="overflow-x-auto border rounded-lg mt-2">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(sqlResult[0]).map((key) => (
                <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sqlResult.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-gray-50">
                {Object.values(row).map((val, vIdx) => (
                  <td key={vIdx} className="px-4 py-2 text-sm border-b">{typeof val === "object" ? JSON.stringify(val) : String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-sm text-gray-500">No data found in table.</p>
    );
  };

  return (
    <div className="min-h-screen bg-white text-main-color p-4 sm:p-6 md:p-8 font-sans">
      <PageHeader heading="Query To Database" />

      <div className="my-8">
        <button
          onClick={() => setShowModal(true)}
          className="hover:text-primary-color gap-2 cursor-pointer hover:bg-gray-200 flex items-center font-bold text-xl px-5 h-10 bg-gray-100 rounded-md"
        >
          Add your db <Plus />
        </button>
      </div>

      {databases.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Connected Databases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases.map((db) => (
              <div key={db.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                <button
                  onClick={() => handleRemoveDatabase(db.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-3">
                  <DatabaseIcon className="text-primary-color mt-1" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-main-color truncate">{db.type}</p>
                    <p className="text-sm text-main-color truncate">{db.host}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">@{db.user}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a word-for-word explanation for your database manipulation"
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSendQuery}
            disabled={!prompt.trim() || databases.length === 0 || loading}
            className="flex items-center gap-2 bg-primary-color text-dark-color px-6 py-2 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {loading ? "Executing..." : "Execute Query"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-dark-color">Query Results</h2>
          </div>

          {results.map((res) => (
            <div key={res.db.id} className="border-b border-gray-200">
              <button
                onClick={() => toggleAccordion(res.db.id)}
                className="w-full flex justify-between items-center px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex flex-col items-start">
                  <p className="text-sm text-gray-500">{res.db.host} ({res.db.type})</p>
                  <p className="text-sm text-dark-color max-w-md truncate">{JSON.stringify(res.query)}</p>
                  {res.error && <p className="text-xs text-red-500">{res.error}</p>}
                </div>
                {openIds.includes(res.db.id) ? <ChevronDown /> : <ChevronRight />}
              </button>

              {openIds.includes(res.db.id) && (
                <div className="px-6 pb-6">
                  {renderResult(res)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DatabaseModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default QueryToDatabase;
