/**
 * Best Time to Go Outside Card
 *
 * Displays a horizontal 24-hour timeline bar for today where each hour
 * is color-coded by its predicted AQI category. Below the bar it highlights:
 *   - Best time window (lowest AQI hours) in sky blue
 *   - Worst time window (highest AQI hours) in red/orange
 *
 * Uses mock forecast data from ForecastChart.
 */

"use client";

import { getNAQIColor, getNAQICategory } from "@/constants/naqi";
import { Sun, Moon, ShieldCheck, ShieldAlert } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HourData {
  hour: number;
  label: string;
  aqi: number;
}

interface BestTimeCardProps {
  todayHourlyData: HourData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

/**
 * Find the best contiguous window (lowest average AQI) of `windowSize` hours.
 */
function findBestWindow(
  data: HourData[],
  windowSize: number,
): { start: number; end: number } {
  let bestStart = 0;
  let bestAvg = Infinity;

  for (let i = 0; i <= data.length - windowSize; i++) {
    const avg =
      data.slice(i, i + windowSize).reduce((sum, d) => sum + d.aqi, 0) /
      windowSize;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }

  return {
    start: data[bestStart].hour,
    end: data[Math.min(bestStart + windowSize - 1, data.length - 1)].hour,
  };
}

/**
 * Find the worst contiguous window (highest average AQI) of `windowSize` hours.
 */
function findWorstWindow(
  data: HourData[],
  windowSize: number,
): { start: number; end: number } {
  let worstStart = 0;
  let worstAvg = -Infinity;

  for (let i = 0; i <= data.length - windowSize; i++) {
    const avg =
      data.slice(i, i + windowSize).reduce((sum, d) => sum + d.aqi, 0) /
      windowSize;
    if (avg > worstAvg) {
      worstAvg = avg;
      worstStart = i;
    }
  }

  return {
    start: data[worstStart].hour,
    end: data[Math.min(worstStart + windowSize - 1, data.length - 1)].hour,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BestTimeCard({ todayHourlyData }: BestTimeCardProps) {
  const best = findBestWindow(todayHourlyData, 3);
  const worst = findWorstWindow(todayHourlyData, 3);

  // Current hour to highlight
  const currentHour = new Date().getHours();

  return (
    <div
      id="best-time-card"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
          <Sun className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Best Time to Go Outside
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Today&apos;s hourly AQI timeline
          </p>
        </div>
      </div>

      {/* 24-hour timeline bar */}
      <div className="mb-3">
        <div className="flex gap-[2px] rounded-lg overflow-hidden">
          {todayHourlyData.map((hour) => {
            const color = getNAQIColor(hour.aqi);
            const isCurrent = hour.hour === currentHour;
            const category = getNAQICategory(hour.aqi);

            return (
              <div
                key={hour.hour}
                className="relative group flex-1 transition-all duration-200"
                style={{ minWidth: 0 }}
              >
                {/* Hour block */}
                <div
                  className={`h-8 sm:h-10 transition-all duration-200 ${
                    isCurrent
                      ? "ring-2 ring-foreground/50 ring-offset-1 ring-offset-card rounded-sm scale-y-110"
                      : "hover:scale-y-110"
                  }`}
                  style={{ backgroundColor: color }}
                />

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                    <p className="text-[10px] font-medium text-foreground">
                      {formatHour(hour.hour)}
                    </p>
                    <p className="text-[10px] font-bold" style={{ color }}>
                      AQI {hour.aqi} · {category?.category}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {[0, 6, 12, 18, 23].map((h) => (
            <span key={h} className="text-[9px] text-muted-foreground/60">
              {formatHour(h)}
            </span>
          ))}
        </div>
      </div>

      {/* Day/Night indicator */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 mb-4">
        <div className="flex items-center gap-1">
          <Moon className="h-3 w-3" />
          <span>Night</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-1">
          <Sun className="h-3 w-3" />
          <span>Day</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-1">
          <Moon className="h-3 w-3" />
          <span>Night</span>
        </div>
      </div>

      {/* Best & Worst windows */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 rounded-xl bg-sky-500/[0.08] border border-sky-500/20 px-4 py-3">
          <ShieldCheck className="h-4.5 w-4.5 text-sky-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-sky-500">
              Best time today: {formatHour(best.start)} –{" "}
              {formatHour(best.end + 1)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Lowest predicted AQI — ideal for outdoor activity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-orange-500/[0.08] border border-orange-500/20 px-4 py-3">
          <ShieldAlert className="h-4.5 w-4.5 text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Avoid: {formatHour(worst.start)} – {formatHour(worst.end + 1)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Peak pollution hours — limit outdoor exposure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
