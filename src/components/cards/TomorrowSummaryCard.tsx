/**
 * Tomorrow's Summary Card
 *
 * A clean card showing tomorrow's forecast summary:
 *   - Average predicted AQI
 *   - Expected NAQI category with color-coded badge
 *   - One-line summary with health advisory
 *
 * Uses hardcoded mock data.
 */

"use client";

import { getNAQICategory, getNAQIColor } from "@/constants/naqi";
import { Calendar, TrendingUp, ArrowRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TomorrowSummaryCardProps {
  averageAqi: number;
  peakAqi: number;
  lowAqi: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function getSummaryMessage(aqi: number): string {
  if (aqi <= 50)
    return "Tomorrow will have clean air. Great for all outdoor activities!";
  if (aqi <= 100)
    return "Tomorrow will be satisfactory. Most people can enjoy outdoor activities.";
  if (aqi <= 200)
    return "Tomorrow will be moderately polluted. Limit outdoor activity in the afternoon.";
  if (aqi <= 300)
    return "Tomorrow will have poor air quality. Avoid prolonged outdoor exertion.";
  if (aqi <= 400)
    return "Tomorrow will have very poor air quality. Stay indoors as much as possible.";
  return "Severe pollution expected tomorrow. Avoid all outdoor activities.";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TomorrowSummaryCard({
  averageAqi,
  peakAqi,
  lowAqi,
}: TomorrowSummaryCardProps) {
  const category = getNAQICategory(averageAqi);
  const color = getNAQIColor(averageAqi);
  const summaryMessage = getSummaryMessage(averageAqi);

  // Tomorrow's date string
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      id="tomorrow-summary-card"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Decorative background circle */}
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-[0.05]"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tomorrow&apos;s Forecast
          </h3>
          <p className="text-[11px] text-muted-foreground">{tomorrowStr}</p>
        </div>
      </div>

      {/* Main stats */}
      <div className="relative z-10 flex items-center gap-5 mb-4">
        {/* Average AQI */}
        <div className="flex flex-col items-center">
          <span
            className="text-4xl font-bold font-heading leading-none"
            style={{ color }}
          >
            {averageAqi}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
            Avg AQI
          </span>
        </div>

        {/* Category badge */}
        <div className="flex-1">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: hexToRgba(color, 0.12),
              color,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {category?.category ?? "Unknown"}
          </span>

          {/* Low/Peak range */}
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>
              Range: {lowAqi}
              <ArrowRight className="inline h-2.5 w-2.5 mx-0.5" />
              {peakAqi}
            </span>
          </div>
        </div>
      </div>

      {/* Summary message */}
      <div className="relative z-10 rounded-xl bg-muted/30 border border-border/50 px-4 py-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summaryMessage}
        </p>
      </div>
    </div>
  );
}
