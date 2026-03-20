"use client";
import { Brain, Database, Zap, Circle } from "lucide-react";

interface HeaderProps {
  uploadedFile: string | null;
}

export default function Header({ uploadedFile }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{
        borderColor: "var(--border)",
        background: "linear-gradient(90deg, #0d1424 0%, #0f1a30 50%, #0d1424 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            boxShadow: "0 0 20px rgba(124,58,237,0.5)",
          }}
        >
          <Brain size={17} color="white" />
        </div>
        <div>
          <h1 className="font-bold text-sm gradient-text" style={{ letterSpacing: "0.02em" }}>
            QueryViz AI
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Conversational Business Intelligence
          </p>
        </div>
      </div>

      {/* Right badges */}
      <div className="flex items-center gap-3">
        {/* Gemini badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa",
          }}
        >
          <Zap size={11} />
          Gemini 2.5 Flash
        </div>

        {/* File badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <Database size={11} style={{ color: "var(--accent2)" }} />
          <span className="max-w-[160px] truncate">
            {uploadedFile ?? "No file uploaded"}
          </span>
          <Circle
            size={7}
            fill={uploadedFile ? "var(--success)" : "var(--text-secondary)"}
            style={{ color: uploadedFile ? "var(--success)" : "var(--text-secondary)" }}
          />
        </div>
      </div>
    </header>
  );
}
