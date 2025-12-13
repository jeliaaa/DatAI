from pydantic import BaseModel
from typing import Optional, List
class DatabaseConfig(BaseModel):
    type: str          # mongo | postgres | neo4j
    host: str
    port: int
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None
class MultiDBRequest(BaseModel):
    prompt: str
    databases: List[DatabaseConfig]
