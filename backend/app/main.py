from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.llm.openai_client import OpenAIClient
from app.connectors.mongo import MongoInspector
from app.connectors.sql import SQLInspector
from app.models.agent import MultiDBRequest

logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/db-agent/run")
async def run_multi_db(req: MultiDBRequest):
    results = []

    for db in req.databases:
        try:
            if db.type.lower() in ("mongo", "mongodb"):
                inspector = MongoInspector(db)
                await inspector.connect()
                collections = await inspector.db.list_collection_names()
                llm = OpenAIClient()
                query = await llm.generate_query("mongo", req.prompt, collections)

                # query['collection'] can now be a list
                data = await inspector.execute(query, collections)
                await inspector.close()

                results.append({
                    "dbType": db.type,
                    "dbHost": db.host,
                    "query": query,
                    "rows": data,  # data is now dict: {collection_name: results}
                    "metadata": {"collections": collections},
                    "error": None
                })

            else:
                # SQL handling unchanged
                inspector = SQLInspector(db.model_dump())
                await inspector.connect()
                tables = await inspector.list_tables()
                llm = OpenAIClient()
                query = await llm.generate_query("sql", req.prompt, tables)
                data = await inspector.execute(query)
                await inspector.close()

                results.append({
                    "dbType": db.type,
                    "dbHost": db.host,
                    "query": query,
                    "rows": data,
                    "metadata": {"tables": tables},
                    "error": None
                })

        except Exception as e:
            results.append({
                "dbType": db.type,
                "dbHost": db.host,
                "query": None,
                "rows": [],
                "metadata": None,
                "error": str(e)
            })

    return results
