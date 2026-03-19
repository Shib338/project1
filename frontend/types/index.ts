export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasDashboard?: boolean;
  isError?: boolean;
}

export interface KPI {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  change: string;
}

export interface ChartConfig {
  id: string;
  type: "line" | "bar" | "pie" | "area" | "scatter";
  title: string;
  description: string;
  xKey: string;
  yKey: string;
  nameKey?: string;
  data: Record<string, unknown>[];
  color: string;
}

export interface DashboardData {
  title: string;
  summary: string;
  charts: ChartConfig[];
  kpis: KPI[];
}
