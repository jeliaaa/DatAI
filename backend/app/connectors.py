# backend/connectors.py
from typing import Dict, Any
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
import pandas as pd

def connect_and_fetch(db_url: str, sample_limit: int = 200) -> Dict[str, Any]:
    """
    Connect to a database (Postgres, MySQL, SQLite) and introspect tables.
    Returns normalized payload: { tables: [{name, columns, rows}] }
    WARNING: This function will attempt connections - use carefully and secure in prod.
    """
    engine = create_engine(db_url, pool_pre_ping=True)
    try:
        inspector = inspect(engine)
        tables = []
        for table_name in inspector.get_table_names():
            # fetch up to sample_limit rows
            with engine.connect() as conn:
                res = conn.execute(text(f"SELECT * FROM {table_name} LIMIT {sample_limit}"))
                df = pd.DataFrame(res.fetchall(), columns=res.keys())
                tables.append({
                    "name": table_name,
                    "columns": list(df.columns.astype(str)),
                    "rows": df.where(pd.notnull(df), None).values.tolist()
                })
        return {"tables": tables}
    except SQLAlchemyError as e:
        raise e
