import asyncpg
from typing import Any, Dict, List, Union


class SQLInspector:
    def __init__(self, cfg: Dict[str, Any]):
        self.cfg = cfg
        self.conn: asyncpg.Connection | None = None

    # -------------------- Connection --------------------

    async def connect(self) -> None:
        self.conn = await asyncpg.connect(
            user=self.cfg.user,
            password=self.cfg.password,
            host=self.cfg.host,
            port=self.cfg.port,
            database=self.cfg.database,
        )

    async def close(self) -> None:
        if self.conn:
            await self.conn.close()

    # -------------------- Metadata --------------------

    async def list_tables(self) -> List[str]:
        rows = await self.conn.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            """
        )
        return [r["table_name"] for r in rows]

    # -------------------- Execution --------------------

    async def execute(
        self,
        payload: Union[str, Dict[str, Any]],
    ) -> Any:
        """
        Supports:
        - Raw SQL string
        - Dict with: action, query, params
        """

        if isinstance(payload, str):
            return await self._execute_sql(payload, [])

        if isinstance(payload, dict):
            query = payload.get("query")
            params = payload.get("params", [])
            action = payload.get("action", "").lower()

            if not isinstance(query, str):
                raise ValueError("SQL query must be a string")

            return await self._execute_sql(query, params, action)

        raise ValueError("Unsupported SQL payload")

    # -------------------- Core Executor --------------------

    async def _execute_sql(
        self,
        query: str,
        params: List[Any],
        action: str | None = None,
    ) -> Any:
        query_lc = query.strip().lower()

        # READ
        if query_lc.startswith("select") or action == "read":
            rows = await self.conn.fetch(query, *params)
            return [dict(row) for row in rows]

        # WRITE with RETURNING
        if "returning" in query_lc:
            rows = await self.conn.fetch(query, *params)
            return [dict(row) for row in rows]

        # INSERT / UPDATE / DELETE
        status = await self.conn.execute(query, *params)
        return {
            "status": status,
            "affected_rows": self._parse_affected_rows(status),
        }

    # -------------------- Helpers --------------------

    @staticmethod
    def _parse_affected_rows(status: str) -> int:
        """
        Example: 'INSERT 0 1' → 1
        """
        parts = status.split()
        return int(parts[-1]) if parts and parts[-1].isdigit() else 0
