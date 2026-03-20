"use client";
import { useState, useEffect, useRef } from "react";
import { Send, BarChart2, Sparkles } from "lucide-react";
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
    const handler = (e: Event) => setInput((e as CustomEvent).detail as string);
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
      style={{
        width: "380px",
        minWidth: "320px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        background: "linear-gradient(180deg, #0d1424 0%, #0a1020 100%)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                }}
              >
                <Sparkles size={13} color="white" />
              </div>
            )}

            <div
              className="max-w-[82%] px-4 py-3 text-sm"
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                      color: "white",
                      borderRadius: "18px 18px 4px 18px",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                    }
                  : {
                      background: msg.isError ? "rgba(239,68,68,0.08)" : "var(--bg-card)",
                      border: `1px solid ${msg.isError ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
                      color: "var(--text-primary)",
                      borderRadius: "18px 18px 18px 4px",
                    }
              }
            >
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              {msg.hasDashboard && (
                <div
                  className="flex items-center gap-1.5 mt-2 pt-2 text-xs font-medium"
                  style={{
                    borderTop: "1px solid var(--border)",
                    color: "var(--accent2)",
                  }}
                >
                  <BarChart2 size={11} /> Dashboard updated →
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                animation: "pulse-glow 2s infinite",
              }}
            >
              <Sparkles size={13} color="white" />
            </div>
            <div
              className="px-4 py-3 flex items-center gap-1.5"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "18px 18px 18px 4px",
              }}
            >
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <span className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
            boxShadow: "0 0 0 0 transparent",
          }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(124,58,237,0.3)")}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your data..."
            className="flex-1 bg-transparent text-sm chat-input"
            style={{ color: "var(--text-primary)" }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-gradient flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
