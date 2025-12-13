from fastapi import APIRouter
from app.models.agent import DBAgentRequest, DBAgentResponse
from app.connectors.mongo import MongoInspector
from app.connectors.sql import SQLInspector
from app.llm.openai_client import OpenAIClient

router = APIRouter()

@router.post("/db-agent", response_model=DBAgentResponse)
async def db_agent(req: DBAgentRequest):
    db_type = req.db.type.lower()
    inspector = None
    result = None

    # 1️⃣ Generate query from OpenAI
    client = OpenAIClient()
    query_data = await client.generate_query(db_type, req.prompt)

    # 2️⃣ Connect to DB and execute
    if db_type == "mongo":
        inspector = MongoInspector(req.db.model_dump())
        await inspector.connect()
        result = await inspector.execute(query_data)
        await inspector.close()
    elif db_type == "postgres":
        inspector = SQLInspector(req.db.dict())
        await inspector.connect()
        result = await inspector.execute(query_data["query"])
        await inspector.close()
    else:
        raise ValueError(f"Unsupported DB type: {db_type}")

    # 3️⃣ Return result
    return DBAgentResponse(query=query_data, result=result)
