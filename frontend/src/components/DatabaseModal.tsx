import React, { useState } from "react";
import { X } from "lucide-react";
import type { DBConfig } from "../types";
import { useDbStore } from "../stores/dbStore";

interface DatabaseModalProps {
  show: boolean;
  onClose: () => void;
}

const DatabaseModal: React.FC<DatabaseModalProps> = ({ show, onClose }) => {
  const { databases, setDatabases } = useDbStore();

  const [newDb, setNewDb] = useState<DBConfig>(() => ({
    id: Date.now(), // lazy initialization
    type: "",
    host: "",
    port: 27017,
    user: "",
    password: "",
    database: "",
  }));

  const handleAdd = () => {
    if (!newDb.type || !newDb.host || !newDb.user) {
      alert("Please fill in all required fields");
      return;
    }

    const updated = [...databases, { ...newDb, id: Date.now() }]; // new unique id
    setDatabases(updated); // persists to localStorage
    setNewDb(() => ({
      id: Date.now(),
      type: "",
      host: "",
      port: 27017,
      user: "",
      password: "",
      database: "",
    }));
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Add Database Connection</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium mb-1">Database Type</label>
          <select
            value={newDb.type}
            onChange={(e) => setNewDb({ ...newDb, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MySQL">MySQL</option>
            <option value="mongo">MongoDB</option>
            <option value="SQLite">SQLite</option>
            <option value="Oracle">Oracle</option>
          </select>

          <label className="block text-sm font-medium mb-1">Host / IP</label>
          <input
            type="text"
            value={newDb.host}
            onChange={(e) => setNewDb({ ...newDb, host: e.target.value })}
            placeholder="127.0.0.1"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <label className="block text-sm font-medium mb-1">Port</label>
          <input
            type="number"
            value={newDb.port}
            onChange={(e) => setNewDb({ ...newDb, port: Number(e.target.value) })}
            placeholder="27017"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={newDb.user}
            onChange={(e) => setNewDb({ ...newDb, user: e.target.value })}
            placeholder="admin"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={newDb.password}
            onChange={(e) => setNewDb({ ...newDb, password: e.target.value })}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <label className="block text-sm font-medium mb-1">Database Name</label>
          <input
            type="text"
            value={newDb.database}
            onChange={(e) => setNewDb({ ...newDb, database: e.target.value })}
            placeholder="my_database"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={handleAdd}
          className="mt-4 w-full bg-primary-color text-main-color py-2 rounded-lg font-bold hover:bg-main-color hover:text-primary-color"
        >
          Add Database
        </button>
      </div>
    </div>
  );
};

export default DatabaseModal;
