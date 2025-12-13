# backend/schemas.py
from pydantic import BaseModel
from typing import List, Any

class Table(BaseModel):
    name: str
    columns: List[str]
    rows: List[List[Any]]

class DatabasePayload(BaseModel):
    tables: List[Table]

class ConnectPayload(BaseModel):
    url: str

class TransformPayload(BaseModel):
    table: str
    columns: List[str]
