// types.ts

// Represents the response from listTables API
export interface ListTablesResponse {
  tables: string[];
}

// Represents a single row in preview or transformed table
export type TableRow = Record<string, string | number | boolean>;

// Represents the response from preview API
export interface PreviewResponse {
  rows: TableRow[];
}

// Represents the response from transform API
export interface TransformResponse {
  rows: TableRow[];
}

// Props for UploadPanel component
export interface UploadPanelProps {
  onUploaded: () => void;
}

// Props for DragColumns component
export interface DragColumnsProps {
  table: string | null;
  previewRows: TableRow[];
  onBuild: (cols: string[]) => void;
}

// Props for TableBuilder component
export interface TableBuilderProps {
  rows: TableRow[];
}


// Database connection info
export interface Database {
  id: number;
  type: string;
  ip: string;
  username: string;
  url: string;
  status: 'connected' | 'disconnected';
  addedAt: string;
}

// Form state for a new database
export interface NewDatabaseForm {
  type: string;
  ip: string;
  username: string;
  url: string;
  password: string
}

// Result of a query
export interface QueryResult {
  id: number;
  query: string;
  timestamp: string;
  rows: number;
}


export interface DBConfig {
  id: number;          // <-- add this
  type: string;
  host: string;
  port: number;
  user?: string;
  password?: string;
  database?: string;
}


export type QueryRow = Record<string, unknown>;
export type MongoResult = Record<string, QueryRow[]>; // multiple collections
export type SQLResult = QueryRow[];

export interface QueryInfo {
  action: "read" | "insert" | "update" | "delete";
  collection: string | string[]; // single or multiple collections
  query: Record<string, unknown> | string; // Mongo JSON object or SQL string
}

export interface DBResult {
  db: DBConfig;
  query: QueryInfo | null; // updated from 'any'
  result: MongoResult | SQLResult | null; // can be SQL array or Mongo object
  error: string | null;
}

