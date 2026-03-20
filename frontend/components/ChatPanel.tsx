"use client";
import { useState, useEffect, useRef } from "react";
import { Send, BarChart2, Sparkles } from "lucide-react";
import { Message } from "@/types";

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  onSendQuery: (query: string) => void;
}

// basic markdown — bold and italic only, no dangerouslySetInnerHTML
function MsgText({ text }: { text: string }) {
  // split on **bold** and *italic* tokens
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i}>{part.slice(1, -1)}</em>;
        // handle newlines
        return (
          <span key={i}>
            {part.split("\n").map((line, j, arr) => (
              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
            ))}
          </span>
        );
      })}
    </>
  );
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
      {/* messages list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginRight: "8px", marginTop: "2px",
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                }}
              >
                <Sparkles size={13} color="white" />
              </div>
            )}

            <div
              style={
                msg.role === "user"
                  ? {
                      maxWidth: "82%", padding: "10px 14px", fontSize: "14px",
                      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                      color: "white",
                      borderRadius: "18px 18px 4px 18px",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                    }
                  : {
                      maxWidth: "82%", padding: "10px 14px", fontSize: "14px",
                      background: msg.isError ? "rgba(239,68,68,0.08)" : "var(--bg-card)",
                      border: `1px solid ${msg.isError ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
                      color: "var(--text-primary)",
                      borderRadius: "18px 18px 18px 4px",
                    }
              }
            >
              <MsgText text={msg.content} />
              {msg.hasDashboard && (
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    marginTop: "8px", paddingTop: "8px",
                    borderTop: "1px solid var(--border)",
                    color: "var(--accent2)", fontSize: "12px", fontWeight: 500,
                  }}
                >
                  <BarChart2 size={11} /> Dashboard updated →
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="animate-fade-in" style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                width: "28px", height: "28px", borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginRight: "8px",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                animation: "pulse-glow 2s infinite",
              }}
            >
              <Sparkles size={13} color="white" />
            </div>
            <div
              style={{
                padding: "10px 14px", display: "flex", alignItems: "center", gap: "6px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "18px 18px 18px 4px",
              }}
            >
              <span className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              <span className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              <span className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input bar */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            borderRadius: "20px", padding: "8px 14px",
            background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about your data..."
            className="chat-input"
            style={{
              flex: 1, background: "transparent", fontSize: "14px",
              color: "var(--text-primary)", border: "none",
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-gradient"
            style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
