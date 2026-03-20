"use client";
import { useRef } from "react";
import { Upload, RotateCcw, Sparkles, FileText, ChevronRight } from "lucide-react";

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
    const file = e.target.files?.[0];
    if (file) { onUpload(file); e.target.value = ""; }
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
      {/* Data Source section */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent2)", boxShadow: "0 0 6px var(--accent2)" }}
          />
          Data Source
        </p>

        {uploadedFile ? (
          <div
            className="gradient-border p-3 mb-3"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}
              >
                <FileText size={13} style={{ color: "var(--accent2)" }} />
              </div>
              <span className="text-xs truncate font-medium" style={{ color: "var(--text-primary)" }}>
                {uploadedFile}
              </span>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs w-full justify-center py-1.5 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: "var(--danger)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <RotateCcw size={11} /> Remove File
            </button>
          </div>
        ) : (
          <div
            className="p-3 mb-3 rounded-xl text-center"
            style={{
              background: "rgba(124,58,237,0.06)",
              border: "1px dashed rgba(124,58,237,0.3)",
            }}
          >
            <FileText size={18} className="mx-auto mb-1.5" style={{ color: "var(--accent)" }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No data uploaded yet</p>
          </div>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          className="btn-gradient flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs"
        >
          <Upload size={13} /> Upload CSV / Excel
        </button>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
          .csv, .xlsx, .xls — not a folder
        </p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleFile} />
      </div>

      {/* Suggested Queries */}
      <div className="p-4 flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <Sparkles size={11} style={{ color: "var(--accent)" }} />
          Try These
        </p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              className="query-btn flex items-center justify-between group"
              onClick={() => window.dispatchEvent(new CustomEvent("suggested-query", { detail: q }))}
            >
              <span>{q}</span>
              <ChevronRight
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: "var(--accent)" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 border-t text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
          Powered by Google Gemini AI
        </p>
      </div>
    </aside>
  );
}
