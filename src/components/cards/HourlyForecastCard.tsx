/**
 * Hourly Forecast Card
 *
 * A scrollable table/list showing each 3-hour slot for the next 48 hours.
 * Each row displays: Time, AQI value, NAQI category badge (color-coded),
 * and dominant pollutant.
 *
 * Features:
 *   - Alternating row backgrounds for readability
 *   - Highlighted current hour row
 *   - Color-coded category badges
 *   - Responsive and scrollable on mobile
 */

"use client";

import { getNAQICategory, getNAQIColor } from "@/constants/naqi";
import { Clock, Wind } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ForecastSlot {
  time: string;
  fullTime: string;
  aqi: number;
  hour: number;
  day: string;
  dominantPollutant: string;
}

interface HourlyForecastCardProps {
  slots: ForecastSlot[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HourlyForecastCard({ slots }: HourlyForecastCardProps) {
  const currentHour = new Date().getHours();

  // Filter to 3-hour intervals
  const threeHourSlots = slots.filter((_, i) => i % 3 === 0);

  return (
    <div
      id="hourly-forecast-card"
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Hourly Forecast
            </h3>
            <p className="text-[11px] text-muted-foreground">
              3-hour intervals for the next 48 hours
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[480px] overflow-y-auto">
        {/* Table header */}
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_80px_120px_100px] sm:grid-cols-[1fr_80px_140px_120px] gap-2 px-4 sm:px-6 py-2.5 bg-muted/50 backdrop-blur-sm border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Time</span>
          <span className="text-center">AQI</span>
          <span className="text-center">Category</span>
          <span className="text-right">Pollutant</span>
        </div>

        {/* Rows */}
        {threeHourSlots.map((slot, index) => {
          const color = getNAQIColor(slot.aqi);
          const category = getNAQICategory(slot.aqi);
          const isCurrent = slot.hour === currentHour;
          const isOddRow = index % 2 === 1;

          return (
            <div
              key={slot.hour}
              className={`grid grid-cols-[1fr_80px_120px_100px] sm:grid-cols-[1fr_80px_140px_120px] gap-2 items-center px-4 sm:px-6 py-3
                transition-colors duration-200
                ${isCurrent ? "bg-primary/[0.06] border-l-2 border-l-primary" : ""}
                ${!isCurrent && isOddRow ? "bg-muted/[0.03]" : ""}
                hover:bg-muted/[0.08]
              `}
            >
              {/* Time */}
              <div className="flex items-center gap-2 min-w-0">
                {isCurrent && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                )}
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${isCurrent ? "text-primary" : "text-foreground"}`}
                  >
                    {slot.time}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {slot.day}
                  </p>
                </div>
              </div>

              {/* AQI Value */}
              <div className="text-center">
                <span
                  className="text-lg font-bold font-heading"
                  style={{ color }}
                >
                  {slot.aqi}
                </span>
              </div>

              {/* Category Badge */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: hexToRgba(color, 0.12),
                    color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {category?.category ?? "Unknown"}
                </span>
              </div>

              {/* Dominant Pollutant */}
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Wind className="h-3 w-3 shrink-0" />
                <span className="font-medium">{slot.dominantPollutant}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
