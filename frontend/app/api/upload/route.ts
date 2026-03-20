import { NextRequest, NextResponse } from "next/server";

// vercel free tier times out at 30s, this is enough for xlsx parsing
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { fileName, csvText, fileBase64 } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let content = "";

    if (csvText) {
      content = csvText;
    } else if (fileBase64) {
      // excel files come in as base64 since we cant send binary over json easily
      const XLSX = await import("xlsx");
      const buf = Buffer.from(fileBase64, "base64");
      const wb = XLSX.read(buf, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      content = XLSX.utils.sheet_to_csv(ws);
    } else {
      return NextResponse.json({ error: "No file content" }, { status: 400 });
    }

    const lines = content.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: "File is empty or has no data rows" }, { status: 400 });
    }

    const sep = lines[0].includes("\t") ? "\t" : ",";
    const columns = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ""));

    return NextResponse.json({
      success: true,
      message: `Loaded ${lines.length - 1} rows, ${columns.length} columns`,
      columns,
      row_count: lines.length - 1,
      csv_data: content,
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
