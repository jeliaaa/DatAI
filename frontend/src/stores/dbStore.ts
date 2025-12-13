import { create } from "zustand";
import { api } from "../utils/axios";
import type { AxiosError } from "axios";
import type { DBConfig, DBResult, MongoResult, QueryInfo } from "../types";



interface DBState {
    databases: DBConfig[];
    prompt: string;
    results: DBResult[];
    loading: boolean;
    setDatabases: (dbs: DBConfig[]) => void;
    setPrompt: (prompt: string) => void;
    setResults: (results: DBResult[]) => void;
    queryAllDatabases: () => Promise<DBResult[]>;
}

// Lazy load from localStorage to persist state
const getInitialDatabases = (): DBConfig[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("databases");
    return saved ? JSON.parse(saved) : [];
};

const getInitialResults = (): DBResult[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("results");
    return saved ? JSON.parse(saved) : [];
};

export const useDbStore = create<DBState>((set, get) => ({
    databases: getInitialDatabases(),
    prompt: "",
    results: getInitialResults(),
    loading: false,

    setDatabases: (dbs) => {
        set({ databases: dbs });
        localStorage.setItem("databases", JSON.stringify(dbs));
    },

    setPrompt: (prompt) => set({ prompt }),

    setResults: (results) => {
        set({ results });
        localStorage.setItem("results", JSON.stringify(results));
    },

    queryAllDatabases: async (): Promise<DBResult[]> => {
        const { databases, prompt } = get();
        if (!prompt || databases.length === 0) return [];

        set({ loading: true, results: [] });
        const results: DBResult[] = [];

        for (const db of databases) {
            try {
                const response = await api.post<
                    Array<{ dbType: string; dbHost: string; query: QueryInfo; rows: MongoResult; error: string | null }>
                >("/db-agent/run", { databases: [db], prompt });

                // For single db:
                const dbResult = response.data[0];
                results.push({
                    db,
                    query: dbResult.query ?? null,
                    result: dbResult.rows ?? null,
                    error: dbResult.error ?? null,
                });
            }
            catch (err: unknown) {
                let message = "Unknown error";
                if (err instanceof Error) message = err.message;
                else if (typeof err === "object" && err !== null && "response" in err) {
                    const axiosErr = err as AxiosError<{ message?: string }>;
                    message = axiosErr.response?.data?.message ?? axiosErr.message ?? message;
                }
                results.push({ db, query: null, result: null, error: message });
            }
        }

        set({ results, loading: false });
        localStorage.setItem("results", JSON.stringify(results));
        return results;
    },

}));
