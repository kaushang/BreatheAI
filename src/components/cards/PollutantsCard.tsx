/**
 * Pollutants Breakdown Card
 *
 * Displays individual pollutant values (PM2.5, PM10, NO₂, SO₂, CO, O₃)
 * in a clean responsive grid. Each pollutant cell shows its name, value,
 * and unit of measurement.
 */

"use client";

import type { PollutantReading } from "@/types";
import { Droplets } from "lucide-react";

interface PollutantsCardProps {
  pollutants: PollutantReading[];
}

/** Maps pollutant display names to compact icon-friendly labels. */
const POLLUTANT_ICONS: Record<string, string> = {
  "PM2.5": "🟤",
  PM10: "🟠",
  "NO₂": "🔴",
  "SO₂": "🟡",
  CO: "⚫",
  "O₃": "🔵",
};

export default function PollutantsCard({ pollutants }: PollutantsCardProps) {
  if (!pollutants || pollutants.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Droplets className="h-4 w-4" />
          Pollutants
        </h3>
        <p className="mt-4 text-sm text-muted-foreground">
          No pollutant data available for this station.
        </p>
      </div>
    );
  }

  return (
    <div
      id="pollutants-card"
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
        <Droplets className="h-4 w-4" />
        Pollutant Breakdown
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pollutants.map((p) => (
          <div
            key={p.name}
            className="group relative rounded-xl border border-border/60 bg-muted/30 p-4 transition-all duration-200 hover:border-border hover:bg-muted/50"
          >
            {/* Pollutant name with icon */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm" aria-hidden>
                {POLLUTANT_ICONS[p.name] ?? "⚪"}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {p.name}
              </span>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none">
              {p.concentration % 1 === 0
                ? p.concentration
                : p.concentration.toFixed(1)}
            </div>

            {/* Unit */}
            <div className="mt-1 text-[10px] text-muted-foreground/60 font-medium">
              {p.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
