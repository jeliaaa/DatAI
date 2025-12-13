import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000",  // <-- point to backend
  headers: { "Content-Type": "application/json" },
});

export async function uploadFile(formData: FormData) {
  const res = await client.post("/upload-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function uploadSql(formData: FormData) {
  const res = await client.post("/upload-sql", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function connectDb(url: string) {
  const res = await client.post("/connect-db", { url });
  return res.data;
}

export async function listTables() {
  const res = await client.get("/tables");
  return res.data;
}

export async function listColumns(table: string) {
  const res = await client.get(`/columns/${encodeURIComponent(table)}`);
  return res.data;
}

export async function preview(table: string, limit = 50) {
  const res = await client.get(`/preview/${encodeURIComponent(table)}?limit=${limit}`);
  return res.data;
}

export async function transform(table: string, columns: string[]) {
  const res = await client.post("/transform", { table, columns });
  return res.data;
}


export async function chatWithGpt(prompt: string) {
  const res = await client.post("/chat", { user_message: prompt });
  return res.data;
}