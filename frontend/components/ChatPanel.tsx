"use client";
import { useState, useEffect, useRef } from "react";
import { Send, BarChart2 } from "lucide-react";
import { Message } from "@/types";

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  onSendQuery: (query: string) => void;
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export default function ChatPanel({ messages, loading, onSendQuery }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail as string;
      setInput(query);
    };
    window.addEventListener("suggested-query", handler);
    return () => window.removeEventListener("suggested-query", handler);
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendQuery(input.trim());
    setInput("");
  };

  return (
    <div
      className="flex flex-col border-r"
      style={{ width: "380px", minWidth: "320px", borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className="max-w-[85%] px-4 py-3 rounded-2xl text-sm"
              style={
                msg.role === "user"
                  ? { background: "var(--accent)", color: "white", borderBottomRightRadius: "4px" }
                  : {
                      background: msg.isError ? "rgba(239,68,68,0.1)" : "var(--bg-card)",
                      border: `1px solid ${msg.isError ? "var(--danger)" : "var(--border)"}`,
                      color: "var(--text-primary)",
                      borderBottomLeftRadius: "4px",
                    }
              }
            >
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
              {msg.hasDashboard && (
                <div
                  className="flex items-center gap-1 mt-2 text-xs"
                  style={{ color: "var(--accent)" }}
                >
                  <BarChart2 size={12} /> Dashboard updated →
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="px-4 py-3 rounded-2xl glass-card flex items-center gap-1"
              style={{ borderBottomLeftRadius: "4px" }}
            >
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your data..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            <Send size={14} color="white" />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: "var(--text-secondary)" }}>
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
}
