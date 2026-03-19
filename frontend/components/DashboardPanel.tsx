"use client";
import { TrendingUp, TrendingDown, Minus, BarChart2, Sparkles } from "lucide-react";
import { DashboardData, KPI } from "@/types";
import ChartRenderer from "./ChartRenderer";

interface DashboardPanelProps {
  dashboard: DashboardData | null;
  loading: boolean;
}

function KPICard({ kpi }: { kpi: KPI }) {
  const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const trendColor = kpi.trend === "up" ? "var(--success)" : kpi.trend === "down" ? "var(--danger)" : "var(--text-secondary)";

  return (
    <div className="glass-card p-4 animate-fade-in">
      <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{kpi.label}</p>
      <p className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
      <div className="flex items-center gap-1">
        <TrendIcon size={12} style={{ color: trendColor }} />
        <span className="text-xs" style={{ color: trendColor }}>{kpi.change}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <BarChart2 size={28} style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Your Dashboard Appears Here
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Ask a question in the chat to generate interactive charts and insights instantly.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 w-full max-w-xs mt-2">
        {["Monthly revenue trends", "Sales by region", "Top products by profit"].map((ex) => (
          <div
            key={ex}
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            💬 &quot;{ex}&quot;
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--accent)", animation: "pulse-glow 2s infinite" }}
        >
          <Sparkles size={24} color="white" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>Generating Dashboard...</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>AI is analyzing your data</p>
      </div>
      <div className="flex gap-2">
        {["Querying data", "Selecting charts", "Rendering"].map((step, i) => (
          <div
            key={step}
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              animationDelay: `${i * 0.3}s`,
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
      <div className="mb-5 animate-fade-in">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{dashboard.title}</h2>
      </div>

      {dashboard.kpis?.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {dashboard.kpis.map((kpi, i) => (
            <KPICard key={i} kpi={kpi} />
          ))}
        </div>
      )}

      {dashboard.charts?.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {dashboard.charts.map((chart) => (
            <div
              key={chart.id}
              className="glass-card p-4 animate-fade-in"
              style={dashboard.charts.length === 1 ? { gridColumn: "1 / -1" } : {}}
            >
              <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                {chart.title}
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                {chart.description}
              </p>
              <ChartRenderer chart={chart} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-card p-6 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          <p>No charts could be generated for this query. Try rephrasing or asking about specific columns.</p>
        </div>
      )}
    </div>
  );
}
