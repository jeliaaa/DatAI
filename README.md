# Fullstack Project: Backend & Frontend
This repository contains a **FastAPI backend** and a **React-Ts frontend**.
---
## Project Structure

root/
├── backend/                # FastAPI backend
│   ├── app/                # Python application code
│   ├── requirements.txt
│   └── .env                # Environment variables (ignored)
│
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── package.json
│   └── .env                # Environment variables (ignored)
│
├── .gitignore
└── README.md

## Technologies

**Backend:** Python 3.11+, FastAPI, Motor, Pydantic, MongoDB  
**Frontend:** React, Tailwind CSS, Node.js, Vite  
**AI Integration:** OpenAI GPT-4 for MongoDB / Sql / PostgreSql / Neo4j query generation

## Setup

### Backend

#bash
```
cd backend
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows
pip install -r requirements.txt
```


Create a `.env` file:
.env
```
OPENAI_API_KEY=your_openai_key
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

---

## Features

* Async FastAPI backend with MongoDB
* React + Tailwind frontend with interactive components
* AI-assisted MongoDB query generation
* Automatic handling of date placeholders (`now`, `new Date()`, etc.)
* Supports MongoDB operations: `find`, `findOne`, `countDocuments`, `distinct`, `aggregate`, `insertOne`, `insertMany`, `update`, `delete`

---

## Notes

* Keep secrets in `.env`; do **not** commit them.
* Backend and frontend can be run independently.
* MongoInspector handles MongoDB Extended JSON dates and converts them to Python `datetime`.

```

This is compact, clear, and covers **all essentials**.  

If you want, I can also **add badges and quick GitHub install instructions** to make it more professional for your repo homepage. Do you want me to do that?
```
