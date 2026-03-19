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
      content: "👋 Hi! I'm **QueryViz AI**. Ask me anything about your business data in plain English.\n\nTry: *\"Show me monthly revenue trends for 2024\"* or *\"Which region has the highest sales?\"*",
      timestamp: new Date(),
    },
  ]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  const sendQuery = async (query: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    conversationHistory.current.push({ role: "user", content: query });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          conversation_history: conversationHistory.current.slice(-6),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }

      const json = await res.json();
      const data: DashboardData = json.data;

      setDashboard(data);
      conversationHistory.current.push({ role: "assistant", content: data.summary });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.summary,
        timestamp: new Date(),
        hasDashboard: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.success) {
      setUploadedFile(file.name);
      setDashboard(null);
      conversationHistory.current = [];
      const sysMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ ${json.message}\n\nColumns: **${json.columns.join(", ")}**\n\nYou can now ask questions about your data!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, sysMsg]);
    }
  };

  const handleReset = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, { method: "DELETE" });
    setUploadedFile(null);
    setDashboard(null);
    conversationHistory.current = [];
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      content: "🔄 Reset to default sales dataset. Ask me anything!",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar uploadedFile={uploadedFile} onUpload={handleUpload} onReset={handleReset} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header uploadedFile={uploadedFile} />
        <div className="flex flex-1 overflow-hidden">
          <ChatPanel messages={messages} loading={loading} onSendQuery={sendQuery} />
          <DashboardPanel dashboard={dashboard} loading={loading} />
        </div>
      </div>
    </div>
  );
}
