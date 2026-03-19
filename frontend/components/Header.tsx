"use client";
import { Brain, Database } from "lucide-react";

interface HeaderProps {
  uploadedFile: string | null;
}

export default function Header({ uploadedFile }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "var(--accent)" }}
        >
          <Brain size={16} color="white" />
        </div>
        <div>
          <h1 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            QueryViz AI
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Conversational Business Intelligence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <Database size={12} style={{ color: "var(--accent)" }} />
          <span style={{ color: "var(--text-secondary)" }}>
            {uploadedFile ? uploadedFile : "No file uploaded"}
          </span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--success)" }}
          />
        </div>
      </div>
    </header>
  );
}
