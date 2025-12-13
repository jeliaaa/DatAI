# mongo_inspector.py
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
import json

class MongoInspector:
    allowed_functions = [
        "find", "findOne", "countDocuments", "distinct",
        "aggregate", "insertOne", "insertMany", "update", "delete"
    ]

    def __init__(self, cfg):
        self.cfg = cfg
        self.client = None
        self.db = None

    async def connect(self):
        """Connect to MongoDB cluster"""
        uri = f"mongodb+srv://{self.cfg.user}:{self.cfg.password}@{self.cfg.host}/"
        print(f"Connecting to {uri}")
        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[self.cfg.database]

    async def execute(self, query_input: dict, collections: list):
        """Execute multiple queries on multiple collections"""
        queries = query_input.get("query")
        if not queries:
            raise ValueError(f"No queries provided. Available collections: {collections}")
        if not isinstance(queries, list):
            queries = [queries]

        results = {}

        for q_item in queries:
            col_name = q_item.get("collection")
            func_name = q_item.get("function", "find")
            params = q_item.get("parameters", {})

            if not col_name:
                raise ValueError(f"Each query must include 'collection'. Provided: {q_item}")
            if func_name not in self.allowed_functions:
                raise ValueError(f"Unsupported function: {func_name}")

            col = self.db[col_name]

            # ----------------- INSERT -----------------
            if func_name == "insertOne":
                doc = self._convert_ids(self._convert_dates(params.get("document", params)))
                result = await col.insert_one(doc)
                results[col_name] = {"inserted_id": str(result.inserted_id)}
            elif func_name == "insertMany":
                docs = [self._convert_ids(self._convert_dates(d.get("document", d))) for d in params]
                result = await col.insert_many(docs)
                results[col_name] = {"inserted_ids": [str(i) for i in result.inserted_ids]}

            # ----------------- READ -----------------
            elif func_name in ["find", "findMany"]:
                docs = await col.find(self._convert_ids(params.get("filter", params))).to_list(100)
                results[col_name] = self._serialize(docs)
            elif func_name == "findOne":
                doc = await col.find_one(self._convert_ids(params.get("filter", params)))
                results[col_name] = self._serialize(doc)
            elif func_name == "countDocuments":
                count = await col.count_documents(self._convert_ids(params.get("filter", params)))
                results[col_name] = count
            elif func_name == "distinct":
                field = params.get("field")
                filter_ = params.get("filter", {})
                results[col_name] = await col.distinct(field, self._convert_ids(filter_))
            elif func_name == "aggregate":
                pipeline = params.get("pipeline", [])
                results[col_name] = await col.aggregate(pipeline).to_list(100)

            # ----------------- UPDATE -----------------
            elif func_name == "update":
                flt = self._convert_ids(self._convert_dates(params.get("filter", {})))
                upd = self._convert_dates(params.get("update", {}))
                if not upd:
                    raise ValueError(f"Update requires 'update' for collection {col_name}")
                result = await col.update_many(flt, upd)
                results[col_name] = {"matched": result.matched_count, "modified": result.modified_count}

            # ----------------- DELETE -----------------
            elif func_name == "delete":
                flt = self._convert_ids(self._convert_dates(params.get("filter", {})))
                result = await col.delete_many(flt)
                results[col_name] = {"deleted": result.deleted_count}

        return results

    # --------------------------- HELPERS ---------------------------
    def _convert_ids(self, data):
        """Recursively convert string _id fields to ObjectId"""
        if isinstance(data, dict):
            new_data = {}
            for k, v in data.items():
                if k == "_id" and isinstance(v, str):
                    try:
                        new_data[k] = ObjectId(v)
                    except:
                        new_data[k] = v
                else:
                    new_data[k] = self._convert_ids(v)
            return new_data
        elif isinstance(data, list):
            return [self._convert_ids(i) for i in data]
        return data

    def _convert_dates(self, data):
        """
        Convert date placeholders and MongoDB extended JSON to datetime.
        Handles:
        - "new Date()", "now", "today", "CURRENT_TIMESTAMP" -> datetime.now()
        - {"$date": {"$numberLong": "1633027200000"}} -> datetime.fromtimestamp(...)
        """
        if isinstance(data, dict):
            # Handle MongoDB extended JSON dates
            if "$date" in data:
                val = data["$date"]
                if isinstance(val, dict) and "$numberLong" in val:
                    return datetime.fromtimestamp(int(val["$numberLong"]) / 1000)
                return datetime.fromisoformat(val)
            return {k: self._convert_dates(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._convert_dates(i) for i in data]
        elif isinstance(data, str):
            normalized = data.strip().lower()
            if normalized in ["now", "today", "current date", "current time", "new date()", "date.now()", "current_timestamp"]:
                return datetime.now()
        return data

    def _serialize(self, data):
        """Recursively convert ObjectId to string"""
        if isinstance(data, list):
            return [self._serialize(i) for i in data]
        if isinstance(data, dict):
            return {k: self._serialize(v) for k, v in data.items()}
        if isinstance(data, ObjectId):
            return str(data)
        if isinstance(data, datetime):
            return data.isoformat()
        return data

    async def close(self):
        if self.client:
            self.client.close()
