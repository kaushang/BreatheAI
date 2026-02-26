/**
 * Year-Over-Year Comparison Chart
 *
 * A grouped bar chart comparing average AQI for each month
 * across 3 years (2022, 2023, 2024) using Recharts.
 * Features:
 *   - X axis: months, Y axis: AQI value
 *   - Three color-coded bar groups per month
 *   - Custom tooltip showing all 3 year values
 *   - Summary line below the chart
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface YearComparisonDataPoint {
  month: string;
  y2022: number;
  y2023: number;
  y2024: number;
}

interface YearComparisonChartProps {
  data: YearComparisonDataPoint[];
  summary: string;
}

// ─── Year colors ─────────────────────────────────────────────────────────────

const YEAR_COLORS = {
  y2022: "#94A3B8", // Slate
  y2023: "#60A5FA", // Blue
  y2024: "#38BDF8", // Sky
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
        {payload.map((entry) => {
          const yearLabel =
            entry.dataKey === "y2022"
              ? "2022"
              : entry.dataKey === "y2023"
                ? "2023"
                : "2024";
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground w-8">
                {yearLabel}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Custom Legend ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  if (!payload) return null;
  const labels: Record<string, string> = {
    y2022: "2022",
    y2023: "2023",
    y2024: "2024",
  };
  return (
    <div className="flex items-center justify-center gap-5 mt-2">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
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

export default function YearComparisonChart({
  data,
  summary,
}: YearComparisonChartProps) {
  return (
    <div
      id="year-comparison-chart"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Year-Over-Year Comparison
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monthly AQI averages — 2022 vs 2023 vs 2024
          </p>
        </div>
      </div>

      <div className="h-[280px] sm:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            barCategoryGap="18%"
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <Legend content={<CustomLegend />} />

            <Bar
              dataKey="y2022"
              fill={YEAR_COLORS.y2022}
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
            />
            <Bar
              dataKey="y2023"
              fill={YEAR_COLORS.y2023}
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
            />
            <Bar
              dataKey="y2024"
              fill={YEAR_COLORS.y2024}
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="h-3 w-3 text-destructive" />
        <span>{summary}</span>
      </div>
    </div>
  );
}
