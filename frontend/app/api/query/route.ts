import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_PROMPT = `You are a Business Intelligence AI assistant. Analyze a dataset and answer natural language queries by generating chart configurations.

Your response MUST be a valid JSON object with this exact structure:
{
  "title": "Dashboard title",
  "summary": "2-3 sentence plain English insight summary",
  "charts": [
    {
      "id": "chart_1",
      "type": "line|bar|pie|area",
      "title": "Chart title",
      "description": "What this chart shows",
      "xKey": "column_name_for_x_axis",
      "yKey": "column_name_for_y_axis",
      "nameKey": "column_name_for_labels",
      "data": [{"key": "value"}],
      "color": "#hex_color"
    }
  ],
  "kpis": [
    {
      "label": "KPI name",
      "value": "formatted value",
      "trend": "up|down|neutral",
      "change": "+12.5%"
    }
  ]
}

Chart type rules:
- line: time-series/trends
- bar: category comparisons
- pie: parts-of-whole (max 6 slices)
- area: cumulative trends

CRITICAL RULES:
- ALWAYS generate at least 1 chart using the actual column names from the dataset
- Use the EXACT column names from the schema as xKey, yKey, nameKey
- If the user query is vague, pick the most relevant numeric column for yKey and text/date column for xKey
- Aggregate data yourself if needed (sum, count, average by category)
- NEVER return empty charts array - always find something useful to show
- Always include 2-4 KPIs with real values calculated from the data
- Max 3 charts, max 20 data points each
- Return ONLY the JSON object, no markdown`;

function csvToJson(csv: string): Record<string, unknown>[] {
  const lines = csv.trim().split("\n").filter(l => l.trim());
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1, 501).map(line => {
    const values = line.split(delimiter);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const val = values[i]?.trim().replace(/^"|"$/g, "") || "";
      obj[h] = val !== "" && !isNaN(Number(val)) ? Number(val) : val;
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ""));
}

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 401 });

    const { query, conversation_history = [], csv_data } = await req.json();
    if (!csv_data) return NextResponse.json({ error: "No data uploaded. Please upload a CSV file first." }, { status: 400 });
    const data = csvToJson(csv_data);
    const headers = Object.keys(data[0] || {});
    const schema = headers.map(h => `- ${h}: sample = ${data.slice(0, 3).map(r => r[h]).join(", ")}`).join("\n");

    let context = "";
    if (conversation_history.length > 0) {
      context = "\n\nPrevious conversation:\n" + conversation_history.slice(-4)
        .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");
    }

    const prompt = `${SYSTEM_PROMPT}\n\nDataset Schema:\n${schema}\n\nDataset (up to 100 rows):\n${JSON.stringify(data)}${context}\n\nUser Query: ${query}\n\nRespond with ONLY the JSON object.`;

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    const raw = response.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");

    return NextResponse.json({ success: true, data: JSON.parse(match[0]) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
