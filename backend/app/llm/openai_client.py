# openai_client.py
import asyncio
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI
import json
from app.core.settings import settings

executor = ThreadPoolExecutor()
client = OpenAI(api_key=settings.openai_api_key)


class OpenAIClient:
    async def generate_query(self, db_type: str, prompt: str, available_collections: list) -> dict:
        """Async wrapper to run GPT synchronously in executor"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            executor, self._sync_generate, db_type, prompt, available_collections
        )

    def _sync_generate(self, db_type: str, prompt: str, available_collections: list) -> dict:
        system_prompt = f"""
You are an expert MongoDB engineer.

Database type: {db_type}.
User instruction: {prompt}
Available collections: {available_collections}

Return a **valid JSON object** in this format:

{{
  "query": [
    {{
      "collection": "collection_name",
      "function": "find|findOne|countDocuments|distinct|aggregate|insertOne|insertMany|update|delete",
      "parameters": {{}}
    }}
  ]
}}

Rules:
1. Always return valid JSON parseable by Python json.loads().
2. Use correct key names: "collection", "function", "parameters".
3. Only include collections requested by the user.
4. Apply filters, updates, or transformations according to the user instruction.
5. Convert any date placeholders (now, today, CURRENT_TIMESTAMP, new Date()) into actual datetime objects in code.
6. Do not include extra comments or explanations inside JSON.
"""

        # Call OpenAI GPT-4 chat completion
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0
        )

        # Robustly get the text content
        choice = response.choices[0]
        if hasattr(choice, "message") and hasattr(choice.message, "content"):
            text = choice.message.content
        elif hasattr(choice, "text"):
            text = choice.text
        else:
            text = str(choice)

        print("GPT output:", text)

        # Parse JSON safely
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback if GPT output is invalid
            return {
                "query": [
                    {"collection": "", "function": "find", "parameters": {"raw": text}}
                ]
            }
