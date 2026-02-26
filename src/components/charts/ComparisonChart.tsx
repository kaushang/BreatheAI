/**
 * Comparison Chart
 *
 * A grouped bar chart using Recharts to compare AQI or pollutant values
 * across multiple Indian cities. Features:
 *   - X axis: selected cities
 *   - Y axis: AQI / pollutant value
 *   - Bars colored by NAQI category when showing AQI
 *   - Toggle to switch between "Current AQI", "PM2.5", "PM10", "NO2"
 *
 * Uses hardcoded mock data for now.
 */

"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getNAQIColor, getNAQICategory } from "@/constants/naqi";
import { BarChart3 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CityComparisonData {
  city: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
}

interface ComparisonChartProps {
  /** Array of city data to compare */
  data: CityComparisonData[];
}

/** Available metrics the user can toggle between */
const METRICS = [
  { key: "aqi", label: "Current AQI" },
  { key: "pm25", label: "PM2.5" },
  { key: "pm10", label: "PM10" },
  { key: "no2", label: "NO₂" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

// ─── Pollutant color helper ──────────────────────────────────────────────────

/** Return a color based on pollutant concentration severity */
function getPollutantBarColor(metric: MetricKey, value: number): string {
  if (metric === "aqi") return getNAQIColor(value);

  // Simple thresholds for pollutant coloring (based on NAQI breakpoints)
  if (metric === "pm25") {
    if (value <= 30) return "#009966";
    if (value <= 60) return "#FFDE33";
    if (value <= 90) return "#FF9933";
    if (value <= 120) return "#CC0033";
    return "#660099";
  }
  if (metric === "pm10") {
    if (value <= 50) return "#009966";
    if (value <= 100) return "#FFDE33";
    if (value <= 250) return "#FF9933";
    if (value <= 350) return "#CC0033";
    return "#660099";
  }
  if (metric === "no2") {
    if (value <= 40) return "#009966";
    if (value <= 80) return "#FFDE33";
    if (value <= 180) return "#FF9933";
    if (value <= 280) return "#CC0033";
    return "#660099";
  }
  return "#808080";
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  activeMetric,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
  activeMetric: MetricKey;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload as CityComparisonData;
  const value = data[activeMetric];
  const color = getPollutantBarColor(activeMetric, value);
  const metricLabel =
    METRICS.find((m) => m.key === activeMetric)?.label ?? activeMetric;

  // Only show NAQI category for AQI metric
  const category = activeMetric === "aqi" ? getNAQICategory(value) : null;

  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{data.city}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold font-heading" style={{ color }}>
          {value}
        </span>
        {category ? (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {category.category}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{metricLabel}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("aqi");

  const metricLabel =
    METRICS.find((m) => m.key === activeMetric)?.label ?? "Value";

  return (
    <div
      id="comparison-chart"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            City Comparison — {metricLabel}
          </h3>
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-[280px] sm:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="city"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
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
              content={<ChartTooltip activeMetric={activeMetric} />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <Bar dataKey={activeMetric} radius={[6, 6, 0, 0]} maxBarSize={64}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getPollutantBarColor(activeMetric, entry[activeMetric])}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric toggle */}
      <div className="mt-4 flex items-center justify-center gap-1 flex-wrap">
        {METRICS.map((metric) => (
          <button
            key={metric.key}
            type="button"
            onClick={() => setActiveMetric(metric.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeMetric === metric.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>
    </div>
  );
}
