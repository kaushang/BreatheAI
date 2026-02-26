/**
 * AQI Card Component
 *
 * The hero card on the dashboard displaying the current AQI reading.
 * Shows the large AQI number, NAQI category with color-coded background,
 * dominant pollutant, and station name.
 *
 * The card background uses a very light tint of the category color
 * for a subtle, non-distracting visual cue.
 */

"use client";

import { getNAQICategory } from "@/constants/naqi";
import type { AQIReading } from "@/types";
import { Wind, MapPin, Radio } from "lucide-react";

interface AQICardProps {
  reading: AQIReading;
}

/**
 * Converts a hex color to an RGBA string with the given opacity.
 * Used to create the light category-tinted background.
 */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function AQICard({ reading }: AQICardProps) {
  const category = getNAQICategory(reading.aqi);
  const colorHex = category?.colorHex ?? "#808080";
  const categoryName = category?.category ?? "Unknown";

  // Light tint for card background (0.08 opacity for light mode feel)
  const tintBg = hexToRgba(colorHex, 0.08);
  const tintBorder = hexToRgba(colorHex, 0.2);

  return (
    <div
      id="aqi-main-card"
      className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 transition-all duration-500"
      style={{
        backgroundColor: tintBg,
        borderColor: tintBorder,
      }}
    >
      {/* Subtle decorative circle in the background */}
      <div
        className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-[0.06] transition-all duration-500"
        style={{ backgroundColor: colorHex }}
      />

      {/* AQI Value */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Live indicator */}
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: colorHex }}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorHex }}
            />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Live AQI
          </span>
        </div>

        {/* Large AQI number */}
        <div
          className="font-heading text-7xl sm:text-8xl font-bold tracking-tight leading-none transition-colors duration-500"
          style={{ color: colorHex }}
        >
          {reading.aqi}
        </div>

        {/* Category badge */}
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-500"
          style={{
            backgroundColor: hexToRgba(colorHex, 0.12),
            color: colorHex,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colorHex }}
          />
          {categoryName}
        </div>

        {/* Dominant pollutant */}
        <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Wind className="h-3.5 w-3.5" />
          <span>
            Dominant pollutant:{" "}
            <span className="font-medium text-foreground">
              {reading.dominant_pollutant}
            </span>
          </span>
        </div>

        {/* Station info */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <MapPin className="h-3 w-3" />
          <span>{reading.station_name}</span>
        </div>

        {/* Source */}
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <Radio className="h-2.5 w-2.5" />
          <span>Source: {reading.source ?? "WAQI"}</span>
        </div>
      </div>
    </div>
  );
}
