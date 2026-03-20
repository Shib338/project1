"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartConfig } from "@/types";

const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#0ea5e9", "#14b8a6"];

const formatValue = (value: unknown) => {
  if (typeof value === "number") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  return String(value);
};

const tooltipStyle = {
  backgroundColor: "#111d35",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
  color: "#f0f6ff",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const axisStyle = { fill: "#7a9cc4", fontSize: 11 };
const gridStyle = { strokeDasharray: "3 3", stroke: "#1e3a5f" };

interface Props { chart: ChartConfig; }

export default function ChartRenderer({ chart }: Props) {
  const { type, data, xKey, yKey, nameKey, color } = chart;
  const chartColor = color || COLORS[0];

  const commonProps = { data, margin: { top: 5, right: 20, left: 10, bottom: 5 } };

  if (type === "pie") {
    const key = nameKey || xKey;
    return (
      <ResponsiveContainer width="100%" height={270}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={key}
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={35}
            paddingAngle={3}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Legend wrapperStyle={{ color: "#7a9cc4", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={270}>
        <LineChart {...commonProps}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey={xKey} tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={formatValue} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Legend wrapperStyle={{ color: "#7a9cc4", fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={chartColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: chartColor, stroke: "white", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={270}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={chartColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey={xKey} tick={axisStyle} />
          <YAxis tick={axisStyle} tickFormatter={formatValue} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Legend wrapperStyle={{ color: "#7a9cc4", fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={chartColor}
            fill={`url(#grad-${chart.id})`}
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={270}>
        <ScatterChart {...commonProps}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey={xKey} tick={axisStyle} />
          <YAxis dataKey={yKey} tick={axisStyle} tickFormatter={formatValue} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
          <Scatter data={data} fill={chartColor} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={270}>
      <BarChart {...commonProps}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={xKey} tick={axisStyle} />
        <YAxis tick={axisStyle} tickFormatter={formatValue} />
        <Tooltip contentStyle={tooltipStyle} formatter={formatValue} />
        <Legend wrapperStyle={{ color: "#7a9cc4", fontSize: 12 }} />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
