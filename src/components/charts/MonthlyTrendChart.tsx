/**
 * Monthly AQI Trend Chart
 *
 * A smooth area chart showing average AQI per month using Recharts.
 * Features:
 *   - X axis: months (Jan–Dec)
 *   - Y axis: AQI (0–500)
 *   - Flat sky-blue area fill (no gradient)
 *   - Horizontal NAQI category bands as faint background stripes
 *   - Custom tooltip with month, AQI, and NAQI category
 */

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { getNAQICategory, NAQI_CATEGORIES } from "@/constants/naqi";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MonthlyDataPoint {
  month: string;
  aqi: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyDataPoint[];
}

// ─── NAQI band colors (very faint) ──────────────────────────────────────────

const BAND_COLORS: Record<string, string> = {
  Good: "rgba(0,153,102,0.06)",
  Satisfactory: "rgba(255,222,51,0.05)",
  Moderate: "rgba(255,153,51,0.05)",
  Poor: "rgba(204,0,51,0.05)",
  "Very Poor": "rgba(102,0,153,0.05)",
  Severe: "rgba(126,0,35,0.05)",
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload as MonthlyDataPoint;
  const category = getNAQICategory(data.aqi);
  const color = category?.colorHex ?? "#808080";

  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{data.month}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold font-heading" style={{ color }}>
          {data.aqi}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {category?.category ?? "Unknown"}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground/60 mt-1">Average AQI</p>
    </div>
  );
}

// ─── Custom Active Dot ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomActiveDot(props: any) {
  const { cx, cy, payload } = props;
  const category = getNAQICategory(payload.aqi);
  const color = category?.colorHex ?? "#808080";

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <div
      id="monthly-trend-chart"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Monthly AQI Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Average AQI by month
          </p>
        </div>

        {/* NAQI legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
          {NAQI_CATEGORIES.slice(0, 4).map((cat) => (
            <div key={cat.category} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cat.colorHex }}
              />
              {cat.category}
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px] sm:h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 50, left: -10, bottom: 0 }}
          >
            {/* NAQI category background bands */}
            {NAQI_CATEGORIES.map((cat) => (
              <ReferenceArea
                key={cat.category}
                y1={cat.range.min}
                y2={cat.range.max}
                fill={BAND_COLORS[cat.category] ?? "transparent"}
                fillOpacity={1}
                ifOverflow="hidden"
                label={{
                  value: cat.category,
                  position: "insideRight",
                  fill: cat.colorHex,
                  fontSize: 9,
                  opacity: 0.4,
                  fontWeight: 600,
                }}
              />
            ))}

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
              domain={[0, 500]}
              ticks={[0, 50, 100, 200, 300, 400, 500]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#38BDF8"
              strokeWidth={2.5}
              fill="#38BDF8"
              fillOpacity={0.08}
              activeDot={<CustomActiveDot />}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
