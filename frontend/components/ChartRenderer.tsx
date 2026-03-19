"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartConfig } from "@/types";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const formatValue = (value: unknown) => {
  if (typeof value === "number") {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  return String(value);
};

interface Props {
  chart: ChartConfig;
}

export default function ChartRenderer({ chart }: Props) {
  const { type, data, xKey, yKey, nameKey, color } = chart;
  const chartColor = color || COLORS[0];

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  const tooltipStyle = {
    backgroundColor: "#1a2235",
    border: "1px solid #2a3a5c",
    borderRadius: "8px",
    color: "#f1f5f9",
  };

  if (type === "pie") {
    const key = nameKey || xKey;
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={key}
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
          <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={formatValue} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke={chartColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
          <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={formatValue} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Legend />
          <Area type="monotone" dataKey={yKey} stroke={chartColor} fill={`url(#grad-${chart.id})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
          <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis dataKey={yKey} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={formatValue} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Scatter data={data} fill={chartColor} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
        <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={formatValue} />
        <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
        <Legend />
        <Bar dataKey={yKey} fill={chartColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
