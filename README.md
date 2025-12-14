# DatAI
## _Communication with databases made easy_
<img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/4aa979cd-1d97-42cf-8ecd-1fbecbb61a76" />

DatAI is a powerful productivty tool that helps to control your databases with simple words.
Working on databases has never been that easy

- Type your clear instructions in English  
- AI makes changes in your database instead of you
- ✨Magic ✨ with no excess queries and  'language' barriers

<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/8d065d32-be39-4cbb-b6f4-0a149661844f" />
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/3777324e-4727-4aca-a9e6-85f13d27b46a" />
## Features

- Straightforward / comfortable UI
- Link your databases with url's and credentials
- type a prompt you want to execute, make it clear, specific
- View the validated table of your database
- Export documents as .json files and view real-time database changes!



This text you see here is *actually- written in Markdown! To get a feel
for Markdown's syntax, type some text into the left window and
watch the results in the right.

## Tech

Dillinger uses a number of open source projects to work properly:

- [ReactJS] - Comfortable/fast UI!
- [FastAPI] - Lightning-fast Backend operations.
- [tailwindcss] - Proper styling.
- [TypeScript] - No Chance to any type-casued bugs!
- [Docker] - duh

And of course DatAI itself is open source with a [public repository][dill]
 on GitHub.

## Installation

Dillinger requires [Python](https://python.org/) 3.11v+ to run.

Install the dependencies and devDependencies and start the server.

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
