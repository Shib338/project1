import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// tried gemini-pro first but flash is faster and good enough for this
const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a BI assistant. Given a dataset and a user question, return a JSON dashboard config.

Return ONLY this JSON shape (no markdown, no explanation):
{
  "title": "string",
  "summary": "2-3 sentence insight",
  "charts": [
    {
      "id": "c1",
      "type": "bar|line|pie|area",
      "title": "string",
      "description": "string",
      "xKey": "exact_column_name",
      "yKey": "exact_column_name",
      "nameKey": "exact_column_name",
      "data": [],
      "color": "#hex"
    }
  ],
  "kpis": [
    { "label": "string", "value": "string", "trend": "up|down|neutral", "change": "string" }
  ]
}

Rules:
- use EXACT column names from the schema for xKey/yKey/nameKey
- always return at least 1 chart, max 3
- max 20 data points per chart
- pie chart max 6 slices
- always 2-4 kpis with real numbers
- if query is vague just pick something useful to show
- line = trends over time, bar = compare categories, pie = proportions, area = cumulative`;

// parse csv rows, skip header, limit to 500 rows so we dont blow up the prompt
function parseCSV(csv: string) {
  const lines = csv.trim().split("\n").filter(l => l.trim());
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ""));

  const rows = lines.slice(1, 501).map(line => {
    const vals = line.split(sep);
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = vals[i]?.trim().replace(/^"|"$/g, "") ?? "";
      row[h] = v !== "" && !isNaN(Number(v)) ? Number(v) : v;
    });
    return row;
  }).filter(r => Object.values(r).some(v => v !== ""));

  return { headers, rows };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 401 });
    }

    const body = await req.json();
    const { query, conversation_history = [], csv_data } = body;

    if (!csv_data) {
      return NextResponse.json(
        { error: "No data uploaded yet. Please upload a CSV or Excel file first." },
        { status: 400 }
      );
    }

    const { headers, rows } = parseCSV(csv_data);

    // build a schema string so gemini knows what columns exist
    const schema = headers
      .map(h => `${h}: ${rows.slice(0, 3).map(r => r[h]).join(" | ")}`)
      .join("\n");

    // include last few messages for follow-up context
    let history = "";
    if (conversation_history.length > 0) {
      history = "\n\nChat history:\n" + conversation_history
        .slice(-4)
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join("\n");
    }

    const prompt = `${SYSTEM_PROMPT}

Schema:
${schema}

Data (${rows.length} rows):
${JSON.stringify(rows)}
${history}

Question: ${query}`;

    const res = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const raw = res.text?.trim() ?? "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini didn't return valid JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: parsed });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
