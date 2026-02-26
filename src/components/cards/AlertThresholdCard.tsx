/**
 * Alert Threshold Card
 *
 * Allows the user to set their AQI alert threshold via a range slider.
 * Features:
 *   - Range slider (50–400, step 10, default 150)
 *   - Large bold display of current threshold value
 *   - NAQI category badge that updates in real time as the slider moves
 *   - "Save Threshold" button in sky blue
 */

"use client";

import { getNAQICategory } from "@/constants/naqi";
import { Bell } from "lucide-react";

interface AlertThresholdCardProps {
  /** Current threshold value */
  value: number;
  /** Called when the slider value changes */
  onChange: (value: number) => void;
  /** Called when the user clicks Save */
  onSave: () => void;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const SLIDER_MIN = 50;
const SLIDER_MAX = 400;

export default function AlertThresholdCard({
  value,
  onChange,
  onSave,
}: AlertThresholdCardProps) {
  const category = getNAQICategory(value);
  const colorHex = category?.colorHex ?? "#808080";
  const categoryName = category?.category ?? "Unknown";

  const sliderPercent =
    ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div
      id="alert-threshold-card"
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        <Bell className="h-3.5 w-3.5" />
        Alert Threshold
      </h3>

      {/* Label */}
      <p className="text-sm text-foreground mb-4">Alert me when AQI crosses</p>

      {/* Large value display */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className="text-5xl font-bold font-heading tracking-tight leading-none transition-colors duration-200"
          style={{ color: colorHex }}
        >
          {value}
        </span>
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: hexToRgba(colorHex, 0.12),
            color: colorHex,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: colorHex }}
          />
          {categoryName}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <input
          id="alert-threshold-slider"
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input w-full"
          style={
            { "--slider-percent": `${sliderPercent}%` } as React.CSSProperties
          }
        />
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground/50">
          <span>{SLIDER_MIN}</span>
          <span>{SLIDER_MAX}</span>
        </div>
      </div>

      {/* Save button */}
      <button
        id="save-threshold-btn"
        type="button"
        onClick={onSave}
        className="w-full rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98]"
      >
        Save Threshold
      </button>
    </div>
  );
}
