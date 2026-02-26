/**
 * AI Response Card
 *
 * Displays a mock AI-generated response to an air quality question.
 * Designed to feel like a clean, informative answer card — not a chatbot bubble.
 *
 * Structure:
 *   - "breatheAI" branding label
 *   - Bold headline answer
 *   - Explanation paragraph
 *   - "Better alternative" section
 *   - AQI badge in the appropriate NAQI color
 */

"use client";

import { getNAQICategory } from "@/constants/naqi";
import { Sparkles, Lightbulb, Activity } from "lucide-react";

interface AIResponseCardProps {
  /** The question the user asked */
  question: string;
  /** The bold headline answer */
  headline: string;
  /** Detailed explanation paragraph */
  explanation: string;
  /** Alternative suggestion */
  alternative: string;
  /** AQI value referenced in the response */
  aqi: number;
}

/**
 * Converts a hex color to an RGBA string with the given opacity.
 */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function AIResponseCard({
  question,
  headline,
  explanation,
  alternative,
  aqi,
}: AIResponseCardProps) {
  const category = getNAQICategory(aqi);
  const colorHex = category?.colorHex ?? "#808080";
  const categoryName = category?.category ?? "Unknown";

  return (
    <div
      id="ai-response-card"
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300"
    >
      {/* ── breatheAI label ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-sky-500/10">
          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-sky-500 uppercase">
          breatheAI
        </span>
      </div>

      {/* ── Question echo ────────────────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground/70 mb-4 italic">
        &ldquo;{question}&rdquo;
      </p>

      {/* ── Headline answer ──────────────────────────────────────────────── */}
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-snug">
        {headline}
      </h3>

      {/* ── Explanation ──────────────────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {explanation}
      </p>

      {/* ── Better alternative ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Better Alternative
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {alternative}
        </p>
      </div>

      {/* ── AQI Badge ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/60 font-medium">
            Referenced AQI
          </span>
        </div>
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all"
          style={{
            backgroundColor: hexToRgba(colorHex, 0.12),
            color: colorHex,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colorHex }}
          />
          {aqi} — {categoryName}
        </div>
      </div>
    </div>
  );
}
