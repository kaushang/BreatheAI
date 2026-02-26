/**
 * Forecast Chart Component
 *
 * A 48-hour AQI forecast line chart using Recharts.
 * - X axis: time labels every 3 hours (e.g. "6 AM", "9 AM")
 * - Y axis: AQI value (0–500)
 * - Line dynamically colored by AQI category segment
 * - Horizontal reference line at the user's alert threshold
 * - Custom tooltip showing AQI value, time, and NAQI category
 *
 * Uses hardcoded mock data for now.
 */

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { getNAQICategory, getNAQIColor } from "@/constants/naqi";

// ─── Mock 48-hour forecast data ──────────────────────────────────────────────

function generateMockForecastData() {
  const data: {
    time: string;
    fullTime: string;
    aqi: number;
    hour: number;
    day: string;
  }[] = [];

  // Start from today at midnight
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  // Realistic AQI pattern for Delhi — lower in early morning, peaks in afternoon
  const hourlyPattern = [
    140, 135, 130, 125, 118, 112, 108, 105, 110, 120, 135, 150, 165, 178, 190,
    198, 205, 210, 215, 205, 195, 180, 165, 155, 148, 142, 138, 132, 125, 118,
    112, 108, 115, 128, 142, 158, 172, 185, 195, 200, 208, 215, 220, 210, 198,
    185, 170, 158,
  ];

  for (let i = 0; i < 48; i++) {
    const date = new Date(start.getTime() + i * 60 * 60 * 1000);
    const hour = date.getHours();
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const dayLabel =
      date.toDateString() === now.toDateString() ? "Today" : "Tomorrow";

    data.push({
      time: `${displayHour} ${ampm}`,
      fullTime: `${dayLabel}, ${displayHour}:00 ${ampm}`,
      aqi: hourlyPattern[i],
      hour: i,
      day: dayLabel,
    });
  }

  return data;
}

export const mockForecastData = generateMockForecastData();

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  value: number;
  payload: {
    fullTime: string;
    aqi: number;
    time: string;
    day: string;
    hour: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const category = getNAQICategory(data.aqi);
  const color = getNAQIColor(data.aqi);

  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{data.fullTime}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold font-heading" style={{ color }}>
          {data.aqi}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${color}18`,
            color,
          }}
        >
          {category?.category ?? "Unknown"}
        </span>
      </div>
    </div>
  );
}

// ─── Custom Dot (only show on hover) ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomActiveDot(props: any) {
  const { cx, cy, payload } = props;
  const color = getNAQIColor(payload.aqi);

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

// ─── Linear Gradient Definition Based on Data ────────────────────────────────

function AQIGradient({ data }: { data: typeof mockForecastData }) {
  const maxHour = data.length - 1;

  return (
    <defs>
      <linearGradient id="aqiLineGradient" x1="0" y1="0" x2="1" y2="0">
        {data
          .filter((_, i) => i % 3 === 0 || i === maxHour)
          .map((point) => (
            <stop
              key={point.hour}
              offset={`${(point.hour / maxHour) * 100}%`}
              stopColor={getNAQIColor(point.aqi)}
            />
          ))}
      </linearGradient>
      <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.15} />
        <stop offset="100%" stopColor="hsl(166, 72%, 40%)" stopOpacity={0.02} />
      </linearGradient>
    </defs>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ForecastChartProps {
  alertThreshold?: number;
}

export default function ForecastChart({
  alertThreshold = 150,
}: ForecastChartProps) {
  const data = mockForecastData;

  // Show only every 3rd hour on x-axis
  const filteredTicks = data.filter((_, i) => i % 3 === 0).map((d) => d.time);

  return (
    <div
      id="forecast-chart"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            AQI Forecast — Next 48 Hours
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Predicted AQI values with 3-hour intervals
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
          {[
            { label: "Good", color: "#009966" },
            { label: "Satisfactory", color: "#FFDE33" },
            { label: "Moderate", color: "#FF9933" },
            { label: "Poor", color: "#CC0033" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px] sm:h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <AQIGradient data={data} />
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              ticks={filteredTicks}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 500]}
              ticks={[0, 50, 100, 200, 300, 400, 500]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Alert threshold line */}
            <ReferenceLine
              y={alertThreshold}
              stroke="#FF6B6B"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: "Your Alert Threshold",
                position: "insideTopRight",
                fill: "#FF6B6B",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Main area + line */}
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="url(#aqiLineGradient)"
              strokeWidth={2.5}
              fill="url(#aqiAreaGradient)"
              activeDot={<CustomActiveDot />}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
