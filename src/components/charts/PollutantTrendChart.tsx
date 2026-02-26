/**
 * Pollutant Trend Chart
 *
 * A multi-line chart showing trends for PM2.5, PM10, and NO2
 * over the selected time range using Recharts.
 * Features:
 *   - Three distinct colored lines (not NAQI colors)
 *   - Legend below the chart
 *   - Custom tooltip showing all 3 pollutant values on hover
 *   - Same X axis as MonthlyTrendChart
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PollutantDataPoint {
  month: string;
  pm25: number;
  pm10: number;
  no2: number;
}

interface PollutantTrendChartProps {
  data: PollutantDataPoint[];
}

// ─── Line colors (distinct, not NAQI) ────────────────────────────────────────

const LINE_COLORS = {
  pm25: "#6366F1", // Indigo
  pm10: "#F59E0B", // Amber
  no2: "#10B981", // Emerald
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground w-12">
              {entry.dataKey === "pm25"
                ? "PM2.5"
                : entry.dataKey === "pm10"
                  ? "PM10"
                  : "NO₂"}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {entry.value}
            </span>
            <span className="text-[10px] text-muted-foreground/50">µg/m³</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Legend ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  if (!payload) return null;
  const labels: Record<string, string> = {
    pm25: "PM2.5",
    pm10: "PM10",
    no2: "NO₂",
  };
  return (
    <div className="flex items-center justify-center gap-5 mt-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {labels[entry.dataKey] ?? entry.dataKey}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PollutantTrendChart({
  data,
}: PollutantTrendChartProps) {
  return (
    <div
      id="pollutant-trend-chart"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Activity className="h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Pollutant Trends
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            PM2.5, PM10, and NO₂ levels over time
          </p>
        </div>
      </div>

      <div className="h-[280px] sm:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend content={<CustomLegend />} />

            <Line
              type="monotone"
              dataKey="pm25"
              stroke={LINE_COLORS.pm25}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
            />
            <Line
              type="monotone"
              dataKey="pm10"
              stroke={LINE_COLORS.pm10}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
            />
            <Line
              type="monotone"
              dataKey="no2"
              stroke={LINE_COLORS.no2}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
