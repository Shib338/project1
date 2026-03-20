"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import DashboardPanel from "@/components/DashboardPanel";
import Header from "@/components/Header";
import { Message, DashboardData } from "@/types";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm **QueryViz AI**. Upload your CSV or Excel file to get started.\n\nClick **Upload Your File** in the sidebar to upload your data, then ask me anything about it!",
      timestamp: new Date(),
    },
  ]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const csvData = useRef<string | null>(null);
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  const sendQuery = async (query: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    conversationHistory.current.push({ role: "user", content: query });

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          conversation_history: conversationHistory.current.slice(-6),
          csv_data: csvData.current,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");

      const data: DashboardData = json.data;
      setDashboard(data);
      conversationHistory.current.push({ role: "assistant", content: data.summary });

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.summary,
        timestamp: new Date(),
        hasDashboard: true,
      }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const name = file.name.toLowerCase();
      let csvText = "";
      let headers: string[] = [];

      if (name.endsWith(".csv") || name.endsWith(".txt")) {
        // For CSV: read only first 2MB chunk to avoid freezing browser
        const chunk = file.slice(0, 10 * 1024 * 1024); // 10MB chunk
        const text = await chunk.text();
        const lines = text.split("\n").filter(l => l.trim());
        const sample = lines.slice(0, 5001); // header + 5000 rows
        csvText = sample.join("\n");
        headers = sample[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      } else {
        // For Excel: parse but limit to 1000 rows
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array", sheetRows: 5001 });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const trimmed = rows.filter((r: unknown[]) => r.some(c => c !== null && c !== undefined && c !== ""));
        csvText = trimmed.map((r: unknown[]) => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        headers = (trimmed[0] as unknown[]).map(String);
      }

      const rowCount = csvText.split("\n").length - 1;
      csvData.current = csvText;
      setUploadedFile(file.name);
      setDashboard(null);
      conversationHistory.current = [];
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Loaded **${file.name}** — using first ${rowCount} rows, ${headers.length} columns.\n\nColumns: **${headers.join(", ")}**\n\nYou can now ask questions about your data!`,
        timestamp: new Date(),
      }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to read file";
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ ${msg}`,
        timestamp: new Date(),
        isError: true,
      }]);
    }
  };

  const handleReset = () => {
    csvData.current = null;
    setUploadedFile(null);
    setDashboard(null);
    conversationHistory.current = [];
    setMessages([{ id: "welcome-reset", role: "assistant", content: "🔄 Reset to default sales dataset. Ask me anything!", timestamp: new Date() }]);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      background: "var(--bg-primary)",
      overflow: "hidden",
    }}>
      <Sidebar uploadedFile={uploadedFile} onUpload={handleUpload} onReset={handleReset} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minWidth: 0 }}>
        <Header uploadedFile={uploadedFile} />
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
          <ChatPanel messages={messages} loading={loading} onSendQuery={sendQuery} />
          <DashboardPanel dashboard={dashboard} loading={loading} />
        </div>
      </div>
    </div>
  );
}
