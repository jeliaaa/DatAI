# backend/parsers.py
from typing import Dict, Any, List
from io import BytesIO
import pandas as pd
import sqlparse
import re
import json

def normalize_table(name: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Convert DataFrame to normalized table dict
    """
    columns = list(df.columns.astype(str))
    rows = df.where(pd.notnull(df), None).values.tolist()
    return {"name": name, "columns": columns, "rows": rows}

def parse_uploaded_file(filename: str, content: bytes) -> Dict[str, Any]:
    """
    Parse CSV / XLSX / JSON uploaded files
    """
    suffix = filename.lower().split(".")[-1]
    
    if suffix == "csv":
        try:
            df = pd.read_csv(BytesIO(content))
            return {"tables": [normalize_table("table", df)]}
        except Exception as e:
            raise ValueError(f"Failed to parse CSV: {e}")
    
    elif suffix in ("xls", "xlsx"):
        try:
            xls = pd.ExcelFile(BytesIO(content))
            tables = []
            for sheet in xls.sheet_names:
                df = xls.parse(sheet_name=sheet)
                tables.append(normalize_table(sheet, df))
            return {"tables": tables}
        except Exception as e:
            raise ValueError(f"Failed to parse Excel: {e}")
    
    elif suffix == "json":
        try:
            text = content.decode("utf-8-sig")  # handle BOM
            data = json.loads(text)
            
            if isinstance(data, dict) and "tables" in data:
                return data
            elif isinstance(data, list):
                df = pd.DataFrame(data)
                return {"tables": [normalize_table("table", df)]}
            else:
                raise ValueError("Unsupported JSON format")
        except Exception as e:
            raise ValueError(f"Failed to parse JSON: {e}")
    
    else:
        raise ValueError(f"Unsupported file extension: {suffix}")

# ---------------- SQL Parsing ----------------

def parse_sql_dump(sql_text: str) -> Dict[str, Any]:
    """
    Naive SQL dump parser using sqlparse:
    Extracts CREATE TABLE columns and INSERT INTO rows.
    """
    parsed = sqlparse.parse(sql_text)
    tables = {}

    # First pass: CREATE TABLE
    create_pattern = re.compile(r"CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+`?(\w+)`?", re.IGNORECASE)
    create_pattern2 = re.compile(r"CREATE\s+TABLE\s+`?(\w+)`?", re.IGNORECASE)

    for stmt in parsed:
        st = str(stmt).strip()
        m = create_pattern.search(st) or create_pattern2.search(st)
        if m:
            name = m.group(1)
            inside = st[st.find("(")+1: st.rfind(")")]
            cols = []
            for line in inside.splitlines():
                line = line.strip().strip(",")
                if not line:
                    continue
                col_match = re.match(r"`?(\w+)`?\s+[\w\(\)]+", line)
                if col_match:
                    cols.append(col_match.group(1))
            tables[name] = {"columns": cols, "rows": []}

    # Second pass: INSERT INTO
    insert_pattern = re.compile(r"INSERT\s+INTO\s+`?(\w+)`?\s*(?:\((.*?)\))?\s*VALUES\s*(.*);", re.IGNORECASE | re.DOTALL)
    statements = sqlparse.split(sql_text)

    for s in statements:
        m = insert_pattern.search(s)
        if m:
            name = m.group(1)
            col_part = m.group(2)
            values_part = m.group(3)

            if col_part:
                cols = [c.strip().strip("`") for c in col_part.split(",")]
            else:
                cols = tables.get(name, {}).get("columns", [])

            tuples = re.findall(r"\((.*?)\)(?:,|$)", values_part, re.DOTALL)
            rows = []
            for t in tuples:
                row = split_values(t)
                rows.append(row)

            if name not in tables:
                tables[name] = {"columns": cols, "rows": rows}
            else:
                tables[name]["rows"].extend(rows)

    # Build normalized payload
    payload_tables = []
    for name, info in tables.items():
        payload_tables.append({
            "name": name,
            "columns": info.get("columns", []),
            "rows": info.get("rows", [])
        })

    if not payload_tables:
        return {"tables": [{"name": "sql_dump", "columns": ["sql"], "rows": [[sql_text]]}]}

    return {"tables": payload_tables}

# ---------------- SQL Helper Functions ----------------

def split_values(s: str) -> List[Any]:
    """
    Split comma-separated values in SQL tuple respecting quotes.
    Returns list of Python-typed values.
    """
    vals = []
    cur = ""
    in_sq = False
    in_dq = False
    esc = False

    for ch in s:
        if esc:
            cur += ch
            esc = False
            continue
        if ch == "\\":
            esc = True
            continue
        if ch == "'" and not in_dq:
            in_sq = not in_sq
            cur += ch
            continue
        if ch == '"' and not in_sq:
            in_dq = not in_dq
            cur += ch
            continue
        if ch == "," and not in_sq and not in_dq:
            val = cur.strip()
            vals.append(convert_sql_value(val))
            cur = ""
            continue
        cur += ch

    if cur.strip() != "":
        vals.append(convert_sql_value(cur.strip()))

    return vals

def convert_sql_value(v: str) -> Any:
    """
    Convert SQL value to Python type
    """
    v = v.strip()
    if v.upper() == "NULL":
        return None
    if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
        inner = v[1:-1].replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
        return inner
    try:
        if "." in v:
            return float(v)
        return int(v)
    except Exception:
        return v
