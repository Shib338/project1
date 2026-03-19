import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { fileName, csvText, fileBase64 } = await req.json();
    if (!fileName) return NextResponse.json({ error: "No file data provided" }, { status: 400 });

    let csvContent = "";

    if (csvText) {
      // Plain text CSV — direct use
      csvContent = csvText;
    } else if (fileBase64) {
      // Excel file via base64
      const XLSX = await import("xlsx");
      const buffer = Buffer.from(fileBase64, "base64");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      csvContent = XLSX.utils.sheet_to_csv(sheet);
    } else {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }

    const lines = csvContent.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return NextResponse.json({ error: "File appears empty or has no data rows." }, { status: 400 });

    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const columns = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ""));

    return NextResponse.json({
      success: true,
      message: `Uploaded '${fileName}' with ${lines.length - 1} rows and ${columns.length} columns.`,
      columns,
      row_count: lines.length - 1,
      csv_data: csvContent,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
