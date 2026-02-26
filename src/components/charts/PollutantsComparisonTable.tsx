/**
 * Pollutants Comparison Table
 *
 * A clean table comparing pollutant values across multiple cities.
 *   - Cities are columns, pollutants are rows
 *   - Each cell is color-coded based on NAQI breakpoints:
 *       green (Good), yellow (Satisfactory), orange (Moderate),
 *       red (Poor), purple (Very Poor), maroon (Severe)
 *   - Horizontally scrollable on mobile
 *
 * Uses the NAQI pollutant breakpoints from constants/naqi.ts to determine
 * the cell color by calculating the sub-index for each value.
 */

"use client";

import { calculateSubIndex, getNAQIColor } from "@/constants/naqi";
import type { CityComparisonData } from "./ComparisonChart";
import { TableProperties } from "lucide-react";

interface PollutantsComparisonTableProps {
  /** Array of city data to compare */
  data: CityComparisonData[];
}

/** Pollutant rows to display in the table */
const POLLUTANT_ROWS = [
  { key: "aqi" as const, label: "Overall AQI", pollutantKey: null, unit: "" },
  {
    key: "pm25" as const,
    label: "PM2.5",
    pollutantKey: "PM2.5",
    unit: "µg/m³",
  },
  { key: "pm10" as const, label: "PM10", pollutantKey: "PM10", unit: "µg/m³" },
  { key: "no2" as const, label: "NO₂", pollutantKey: "NO2", unit: "µg/m³" },
];

/**
 * Return the color for a cell based on the pollutant value.
 * For AQI we use getNAQIColor directly.
 * For pollutants we compute the sub-index and get the NAQI color for that sub-index.
 */
function getCellColor(
  row: (typeof POLLUTANT_ROWS)[number],
  value: number,
): string {
  if (row.key === "aqi") {
    return getNAQIColor(value);
  }

  // For pollutants, calculate the sub-index from the concentration
  if (row.pollutantKey) {
    const subIndex = calculateSubIndex(row.pollutantKey, value);
    if (subIndex !== null) return getNAQIColor(subIndex);
  }

  return "#808080";
}

/**
 * Return a background opacity class based on how dangerous the value is.
 * Keeps the tint subtle but visible.
 */
function getCellBgOpacity(
  row: (typeof POLLUTANT_ROWS)[number],
  value: number,
): number {
  if (row.key === "aqi") {
    if (value <= 50) return 0.08;
    if (value <= 100) return 0.1;
    if (value <= 200) return 0.1;
    return 0.12;
  }
  // For pollutants, calculate sub-index first
  if (row.pollutantKey) {
    const subIndex = calculateSubIndex(row.pollutantKey, value);
    if (subIndex !== null) {
      if (subIndex <= 50) return 0.08;
      if (subIndex <= 100) return 0.1;
      if (subIndex <= 200) return 0.1;
      return 0.12;
    }
  }
  return 0.08;
}

export default function PollutantsComparisonTable({
  data,
}: PollutantsComparisonTableProps) {
  return (
    <div
      id="pollutants-comparison-table"
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 sm:px-6 pt-5 pb-4">
        <TableProperties className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Pollutants Breakdown
        </h3>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-t border-border">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 sm:px-6 py-3 bg-muted/30 w-[140px]">
                Pollutant
              </th>
              {data.map((cityData) => (
                <th
                  key={cityData.city}
                  className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 sm:px-6 py-3 bg-muted/30"
                >
                  {cityData.city}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POLLUTANT_ROWS.map((row, rowIndex) => (
              <tr
                key={row.key}
                className={`border-t border-border transition-colors ${
                  rowIndex % 2 === 1 ? "bg-muted/10" : ""
                }`}
              >
                {/* Row label */}
                <td className="text-sm text-foreground font-medium px-4 sm:px-6 py-3">
                  <div className="flex flex-col">
                    <span>{row.label}</span>
                    {row.unit && (
                      <span className="text-[10px] text-muted-foreground/50">
                        {row.unit}
                      </span>
                    )}
                  </div>
                </td>

                {/* City value cells */}
                {data.map((cityData) => {
                  const value = cityData[row.key];
                  const color = getCellColor(row, value);
                  const opacity = getCellBgOpacity(row, value);

                  return (
                    <td
                      key={cityData.city}
                      className="text-center px-4 sm:px-6 py-3"
                    >
                      <span
                        className="inline-flex items-center justify-center min-w-[56px] rounded-lg px-2.5 py-1 text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: `${color}${Math.round(opacity * 255)
                            .toString(16)
                            .padStart(2, "0")}`,
                          color: color,
                        }}
                      >
                        {value}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
