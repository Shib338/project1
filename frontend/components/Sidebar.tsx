"use client";
import { useRef } from "react";
import { Upload, RotateCcw, Sparkles, FileText } from "lucide-react";

const SUGGESTED_QUERIES = [
  "Show overall revenue summary",
  "Which category has the highest sales?",
  "Show top 5 products by revenue",
  "Compare sales across all regions",
  "Show monthly trends",
  "What are the key insights from this data?",
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
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  };

  return (
    <aside
      className="w-64 flex flex-col border-r overflow-y-auto"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
          Data Source
        </p>

        {uploadedFile ? (
          <div className="glass-card p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} style={{ color: "var(--accent)" }} />
              <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>
                {uploadedFile}
              </span>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs w-full justify-center py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--danger)", border: "1px solid var(--danger)" }}
            >
              <RotateCcw size={12} /> Reset to Default
            </button>
          </div>
        ) : (
          <div
            className="glass-card p-3 mb-3 text-center text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <FileText size={16} className="mx-auto mb-1" style={{ color: "var(--accent)" }} />
            No data uploaded yet
          </div>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <Upload size={13} /> Upload Your File
        </button>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--text-secondary)" }}>
          Select a .csv or .xlsx <strong>file</strong>, not a folder
        </p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleFile} />
      </div>

      <div className="p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
          <Sparkles size={12} className="inline mr-1" />
          Suggested Queries
        </p>
        <div className="flex flex-col gap-2">
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              className="text-left text-xs p-2.5 rounded-lg transition-all hover:border-indigo-500"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onClick={() => {
                const event = new CustomEvent("suggested-query", { detail: q });
                window.dispatchEvent(event);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
