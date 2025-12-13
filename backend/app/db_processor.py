# backend/db_processor.py
import json
from pathlib import Path
from typing import Dict, Any, List

STORAGE_PATH = Path(__file__).parent / "storage" / "uploaded.json"
STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)

MAX_PREVIEW_ROWS = 500  # safety

def save_payload(payload: Dict[str, Any]) -> None:
    """
    Save the normalized payload to storage (overwrites latest).
    """
    with open(STORAGE_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

def load_payload() -> Dict[str, Any]:
    if not STORAGE_PATH.exists():
        return {"tables": []}
    with open(STORAGE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def list_tables() -> List[str]:
    data = load_payload()
    return [t["name"] for t in data.get("tables", [])]

def list_columns(table_name: str):
    data = load_payload()
    for t in data.get("tables", []):
        if t["name"] == table_name:
            return t["columns"]
    return []

def get_rows(table_name: str):
    data = load_payload()
    for t in data.get("tables", []):
        if t["name"] == table_name:
            return t["rows"]
    return []

def preview_table(table_name: str, limit: int = 50):
    data = load_payload()
    for t in data.get("tables", []):
        if t["name"] == table_name:
            return t["rows"][: min(limit, MAX_PREVIEW_ROWS)]
    return []

def transform_table(table_name: str, columns: List[str]):
    """
    Return rows filtered to only include the selected columns, shape as list of objects.
    """
    data = load_payload()
    for t in data.get("tables", []):
        if t["name"] == table_name:
            idx_map = []
            for c in columns:
                try:
                    idx_map.append(t["columns"].index(c))
                except ValueError:
                    idx_map.append(None)
            result = []
            for row in t["rows"]:
                obj = {}
                for i, col in enumerate(columns):
                    idx = idx_map[i]
                    obj[col] = row[idx] if (idx is not None and idx < len(row)) else None
                result.append(obj)
            return result
    return []
