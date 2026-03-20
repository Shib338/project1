"use client";
import { useRef } from "react";
import { Upload, RotateCcw, Sparkles, FileText, ChevronRight } from "lucide-react";

// these are youtube-specific but work for any dataset really
const SUGGESTED_QUERIES = [
  "Show views by category",
  "Compare likes and comments by region",
  "Top 5 categories by total views",
  "Videos by language distribution",
  "Sentiment score trends over time",
  "Which region has highest engagement?",
];

interface SidebarProps {
  uploadedFile: string | null;
  onUpload: (file: File) => void;
  onReset: () => void;
}

export default function Sidebar({ uploadedFile, onUpload, onReset }: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { onUpload(f); e.target.value = ""; }
  };

  return (
    <aside
      style={{
        width: "256px",
        minWidth: "256px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        background: "linear-gradient(180deg, #0d1424 0%, #0a1020 100%)",
        height: "100%",
      }}
    >
      {/* upload section */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent2)", boxShadow: "0 0 6px var(--accent2)", display: "inline-block" }} />
          Data Source
        </p>

        {uploadedFile ? (
          <div className="gradient-border" style={{ background: "var(--bg-card)", padding: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <FileText size={13} style={{ color: "var(--accent2)" }} />
              </div>
              <span style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)", fontWeight: 500 }}>
                {uploadedFile}
              </span>
            </div>
            <button
              onClick={onReset}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", width: "100%", justifyContent: "center", padding: "6px", borderRadius: "8px", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <RotateCcw size={11} /> Remove File
            </button>
          </div>
        ) : (
          <div style={{ padding: "12px", marginBottom: "12px", borderRadius: "12px", textAlign: "center", background: "rgba(124,58,237,0.06)", border: "1px dashed rgba(124,58,237,0.3)" }}>
            <FileText size={18} style={{ color: "var(--accent)", margin: "0 auto 6px" }} />
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No file uploaded yet</p>
          </div>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          className="btn-gradient"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "10px", borderRadius: "12px", fontSize: "12px" }}
        >
          <Upload size={13} /> Upload CSV / Excel
        </button>
        <p style={{ fontSize: "11px", marginTop: "8px", textAlign: "center", color: "var(--text-secondary)", opacity: 0.6 }}>
          .csv, .xlsx, .xls — not a folder
        </p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" style={{ display: "none" }} onChange={handleFile} />
      </div>

      {/* suggested queries */}
      <div style={{ padding: "16px", flex: 1 }}>
        <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={11} style={{ color: "var(--accent)" }} />
          Try These
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              className="query-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("suggested-query", { detail: q }))}
            >
              <span>{q}</span>
              <ChevronRight size={12} style={{ color: "var(--accent)", flexShrink: 0, opacity: 0 }} className="chevron-icon" />
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", opacity: 0.45 }}>Powered by Google Gemini</p>
      </div>
    </aside>
  );
}
