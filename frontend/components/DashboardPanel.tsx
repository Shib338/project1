"use client";
import { TrendingUp, TrendingDown, Minus, BarChart2, Sparkles, Zap } from "lucide-react";
import { DashboardData, KPI } from "@/types";
import ChartRenderer from "./ChartRenderer";

interface DashboardPanelProps {
  dashboard: DashboardData | null;
  loading: boolean;
}

function KPICard({ kpi, index }: { kpi: KPI; index: number }) {
  const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    kpi.trend === "up" ? "var(--success)" : kpi.trend === "down" ? "var(--danger)" : "var(--text-secondary)";

  const accentColors = [
    { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)", glow: "rgba(124,58,237,0.2)" },
    { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.3)",  glow: "rgba(6,182,212,0.2)" },
    { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", glow: "rgba(16,185,129,0.2)" },
    { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.2)" },
  ];
  const c = accentColors[index % 4];

  return (
    <div
      className="p-4 rounded-2xl animate-fade-in transition-all hover:scale-[1.02]"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 20px ${c.glow}`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <p className="text-xs mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>{kpi.label}</p>
      <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
      <div className="flex items-center gap-1">
        <TrendIcon size={12} style={{ color: trendColor }} />
        <span className="text-xs font-medium" style={{ color: trendColor }}>{kpi.change}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <div className="relative animate-float">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
            border: "1px solid rgba(124,58,237,0.3)",
            boxShadow: "0 0 40px rgba(124,58,237,0.2)",
          }}
        >
          <BarChart2 size={34} style={{ color: "var(--accent)" }} />
        </div>
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
        >
          <Sparkles size={12} color="white" />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2 gradient-text">Your Dashboard Appears Here</h3>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
          Upload a CSV or Excel file, then ask a question to generate interactive charts instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
        {["Top categories by views", "Engagement by region", "Videos by language"].map((ex, i) => (
          <div
            key={ex}
            className="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <Zap size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
            &quot;{ex}&quot;
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  const steps = ["Reading data", "Analyzing", "Building charts"];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            animation: "pulse-glow 2s infinite",
          }}
        >
          <Sparkles size={26} color="white" />
        </div>
        {/* Spinning ring */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: "2px solid transparent",
            borderTopColor: "var(--accent2)",
            animation: "spin-slow 1.2s linear infinite",
          }}
        />
      </div>

      <div className="text-center">
        <p className="font-semibold gradient-text">Generating Dashboard...</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>AI is analyzing your data</p>
      </div>

      <div className="flex gap-2">
        {steps.map((step, i) => (
          <div
            key={step}
            className="text-xs px-3 py-1.5 rounded-full shimmer"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPanel({ dashboard, loading }: DashboardPanelProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
        <LoadingState />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: "var(--bg-primary)" }}>
      {/* Title */}
      <div className="mb-5 animate-fade-in">
        <h2 className="text-xl font-bold gradient-text">{dashboard.title}</h2>
      </div>

      {/* KPIs */}
      {dashboard.kpis?.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {dashboard.kpis.map((kpi, i) => (
            <KPICard key={i} kpi={kpi} index={i} />
          ))}
        </div>
      )}

      {/* Charts */}
      {dashboard.charts?.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {dashboard.charts.map((chart, i) => (
            <div
              key={chart.id}
              className="animate-fade-in"
              style={{
                ...(dashboard.charts.length === 1 ? { gridColumn: "1 / -1" } : {}),
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="p-5 rounded-2xl h-full"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-bright)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(124,58,237,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {chart.title}
                </h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                  {chart.description}
                </p>
                <ChartRenderer chart={chart} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="p-6 text-center rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          No charts could be generated. Try rephrasing or asking about specific columns.
        </div>
      )}
    </div>
  );
}
