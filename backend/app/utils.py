# backend/utils.py
# helper utilities reserved for further extension
import os
from pathlib import Path

def ensure_storage() -> Path:
    base = Path(__file__).parent / "storage"
    base.mkdir(parents=True, exist_ok=True)
    return base
