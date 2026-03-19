from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
import json
import re
import io
from typing import Optional

app = FastAPI(title="QueryViz AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from google import genai as google_genai
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = google_genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "sales_data.csv")
uploaded_df: Optional[pd.DataFrame] = None


def get_dataframe() -> pd.DataFrame:
    global uploaded_df
    if uploaded_df is not None:
        return uploaded_df
    return pd.read_csv(DATA_PATH)


def get_data_schema(df: pd.DataFrame) -> str:
    schema_lines = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample = df[col].dropna().head(3).tolist()
        schema_lines.append(f"- {col} ({dtype}): sample values = {sample}")
    return "\n".join(schema_lines)


SYSTEM_PROMPT = """You are a Business Intelligence AI assistant. Your job is to analyze a dataset and answer natural language queries by generating chart configurations.

You will be given:
1. The dataset schema with column names, types, and sample values
2. The actual data as JSON
3. A user query

Your response MUST be a valid JSON object with this exact structure:
{{
  "title": "Dashboard title",
  "summary": "2-3 sentence plain English insight summary for a non-technical executive",
  "charts": [
    {{
      "id": "chart_1",
      "type": "line|bar|pie|area|scatter",
      "title": "Chart title",
      "description": "What this chart shows",
      "xKey": "column_name_for_x_axis",
      "yKey": "column_name_for_y_axis",
      "nameKey": "column_name_for_labels (for pie charts)",
      "data": [ {{ "key": "value" }} ],
      "color": "#hex_color"
    }}
  ],
  "kpis": [
    {{
      "label": "KPI name",
      "value": "formatted value",
      "trend": "up|down|neutral",
      "change": "+12.5%"
    }}
  ]
}}

Chart type selection rules:
- Use "line" for time-series or trend data
- Use "bar" for comparisons across categories
- Use "pie" for parts-of-a-whole (max 6 slices)
- Use "area" for cumulative trends
- Use "scatter" for correlations

IMPORTANT RULES:
- Only use data that actually exists in the dataset
- If the query cannot be answered with the available data, set charts to [] and explain in summary
- Always include 2-4 KPI cards with key metrics
- Generate 1-3 charts maximum per dashboard
- Keep data arrays concise (max 20 data points per chart)
- Return ONLY the JSON object, no markdown, no explanation outside JSON
"""


class QueryRequest(BaseModel):
    query: str
    conversation_history: list = []


@app.post("/api/query")
async def process_query(request: QueryRequest):
    try:
        if not client:
            raise HTTPException(status_code=401, detail="Gemini API key not set. Please set the GEMINI_API_KEY environment variable and restart the server.")
        df = get_dataframe()
        schema = get_data_schema(df)

        # Prepare a sample of data for Gemini (limit to avoid token overflow)
        data_sample = df.head(100).to_json(orient="records")

        conversation_context = ""
        if request.conversation_history:
            conversation_context = "\n\nPrevious conversation context:\n"
            for msg in request.conversation_history[-4:]:
                conversation_context += f"{msg['role'].upper()}: {msg['content']}\n"

        prompt = f"""{SYSTEM_PROMPT}

Dataset Schema:
{schema}

Dataset (sample of up to 100 rows):
{data_sample}

{conversation_context}

User Query: {request.query}

Respond with ONLY the JSON object."""

        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        raw_text = response.text.strip()

        # Extract JSON from response
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in response")

        result = json.loads(json_match.group())
        return {"success": True, "data": result}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid response format. Please try rephrasing your query.")
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg or "api_key" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid Gemini API key. Please check your configuration.")
        raise HTTPException(status_code=500, detail=f"Error processing query: {error_msg}")


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    global uploaded_df
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    try:
        contents = await file.read()
        uploaded_df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        columns = list(uploaded_df.columns)
        row_count = len(uploaded_df)
        return {
            "success": True,
            "message": f"Uploaded '{file.filename}' with {row_count} rows and {len(columns)} columns.",
            "columns": columns,
            "row_count": row_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")


@app.delete("/api/upload")
async def reset_to_default():
    global uploaded_df
    uploaded_df = None
    return {"success": True, "message": "Reset to default sales dataset."}


@app.get("/api/schema")
async def get_schema():
    df = get_dataframe()
    schema = []
    for col in df.columns:
        schema.append({
            "column": col,
            "type": str(df[col].dtype),
            "sample": df[col].dropna().head(3).tolist()
        })
    return {
        "columns": schema,
        "row_count": len(df),
        "is_custom": uploaded_df is not None
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "QueryViz AI is running"}
