/**
 * Trends Page
 *
 * Historical AQI trend analysis for a selected city.
 * Includes:
 *   1. Page header with city/India toggle
 *   2. Time range selector tabs (30d, 6m, 12m, 3y)
 *   3. Monthly AQI trend area chart
 *   4. Worst & Best months card
 *   5. Pollutant trends multi-line chart
 *   6. Year-over-year comparison bar chart
 *   7. Seasonal insight card
 *
 * All data is hardcoded mock data for now — no backend connection.
 */

"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import PollutantTrendChart from "@/components/charts/PollutantTrendChart";
import YearComparisonChart from "@/components/charts/YearComparisonChart";
import { getNAQICategory } from "@/constants/naqi";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Leaf,
} from "lucide-react";
import type { MonthlyDataPoint } from "@/components/charts/MonthlyTrendChart";
import type { PollutantDataPoint } from "@/components/charts/PollutantTrendChart";
import type { YearComparisonDataPoint } from "@/components/charts/YearComparisonChart";

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const TIME_RANGES = [
  { key: "30d", label: "Last 30 Days" },
  { key: "6m", label: "Last 6 Months" },
  { key: "12m", label: "Last 12 Months" },
  { key: "3y", label: "Last 3 Years" },
] as const;

type TimeRange = (typeof TIME_RANGES)[number]["key"];

// ─── Mock Data: Delhi ────────────────────────────────────────────────────────

const DELHI_MONTHLY: Record<TimeRange, MonthlyDataPoint[]> = {
  // 12-month data for Delhi
  "12m": MONTHS.map((month, i) => ({
    month,
    aqi: [287, 241, 189, 143, 118, 95, 78, 82, 110, 198, 312, 298][i],
  })),
  // Last 6 months: Jul–Dec
  "6m": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => ({
    month,
    aqi: [78, 82, 110, 198, 312, 298][i],
  })),
  // Last 30 days: show last 4 weeks
  "30d": ["Week 1", "Week 2", "Week 3", "Week 4"].map((month, i) => ({
    month,
    aqi: [295, 305, 288, 278][i],
  })),
  // Last 3 years: show yearly averages per month (same shape)
  "3y": MONTHS.map((month, i) => ({
    month,
    aqi: [280, 235, 185, 140, 115, 92, 75, 80, 108, 195, 305, 292][i],
  })),
};

const DELHI_POLLUTANTS: Record<TimeRange, PollutantDataPoint[]> = {
  "12m": MONTHS.map((month, i) => ({
    month,
    pm25: [165, 138, 105, 78, 62, 48, 35, 38, 58, 112, 185, 172][i],
    pm10: [220, 185, 155, 118, 95, 72, 55, 60, 88, 162, 245, 228][i],
    no2: [68, 58, 45, 34, 28, 22, 18, 19, 28, 48, 75, 70][i],
  })),
  "6m": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => ({
    month,
    pm25: [35, 38, 58, 112, 185, 172][i],
    pm10: [55, 60, 88, 162, 245, 228][i],
    no2: [18, 19, 28, 48, 75, 70][i],
  })),
  "30d": ["Week 1", "Week 2", "Week 3", "Week 4"].map((month, i) => ({
    month,
    pm25: [170, 178, 165, 160][i],
    pm10: [225, 235, 220, 215][i],
    no2: [68, 72, 65, 62][i],
  })),
  "3y": MONTHS.map((month, i) => ({
    month,
    pm25: [160, 132, 100, 75, 60, 45, 32, 35, 55, 108, 180, 168][i],
    pm10: [215, 180, 150, 115, 92, 68, 52, 58, 85, 158, 240, 222][i],
    no2: [65, 55, 42, 32, 26, 20, 16, 17, 26, 45, 72, 68][i],
  })),
};

// ─── Mock Data: India Average ────────────────────────────────────────────────

const INDIA_MONTHLY: Record<TimeRange, MonthlyDataPoint[]> = {
  "12m": MONTHS.map((month, i) => ({
    month,
    aqi: [185, 162, 138, 108, 92, 78, 65, 68, 88, 142, 205, 195][i],
  })),
  "6m": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => ({
    month,
    aqi: [65, 68, 88, 142, 205, 195][i],
  })),
  "30d": ["Week 1", "Week 2", "Week 3", "Week 4"].map((month, i) => ({
    month,
    aqi: [192, 200, 188, 182][i],
  })),
  "3y": MONTHS.map((month, i) => ({
    month,
    aqi: [180, 158, 135, 105, 90, 75, 62, 65, 85, 138, 200, 190][i],
  })),
};

const INDIA_POLLUTANTS: Record<TimeRange, PollutantDataPoint[]> = {
  "12m": MONTHS.map((month, i) => ({
    month,
    pm25: [105, 92, 75, 58, 48, 38, 28, 30, 45, 82, 125, 118][i],
    pm10: [155, 135, 115, 88, 72, 58, 42, 48, 68, 120, 175, 165][i],
    no2: [45, 38, 30, 24, 20, 16, 13, 14, 22, 35, 52, 48][i],
  })),
  "6m": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => ({
    month,
    pm25: [28, 30, 45, 82, 125, 118][i],
    pm10: [42, 48, 68, 120, 175, 165][i],
    no2: [13, 14, 22, 35, 52, 48][i],
  })),
  "30d": ["Week 1", "Week 2", "Week 3", "Week 4"].map((month, i) => ({
    month,
    pm25: [115, 122, 110, 108][i],
    pm10: [162, 170, 158, 155][i],
    no2: [48, 52, 46, 44][i],
  })),
  "3y": MONTHS.map((month, i) => ({
    month,
    pm25: [100, 88, 72, 55, 45, 35, 26, 28, 42, 78, 120, 112][i],
    pm10: [150, 130, 110, 85, 70, 55, 40, 45, 65, 115, 170, 160][i],
    no2: [42, 36, 28, 22, 18, 14, 12, 13, 20, 32, 50, 45][i],
  })),
};

// ─── Year-over-year data ─────────────────────────────────────────────────────

const YEAR_COMPARISON_DATA: YearComparisonDataPoint[] = MONTHS.map(
  (month, i) => ({
    month,
    y2022: [265, 225, 178, 135, 110, 88, 72, 75, 102, 185, 295, 280][i],
    y2023: [275, 232, 185, 140, 115, 92, 75, 78, 108, 192, 305, 290][i],
    y2024: [287, 241, 189, 143, 118, 95, 78, 82, 110, 198, 312, 298][i],
  }),
);

// ─── Seasonal insights data ─────────────────────────────────────────────────

const SEASONAL_INSIGHTS = [
  {
    emoji: "🌸",
    season: "Spring",
    months: "Mar – May",
    description: "Moderate pollution, dust storms occasional",
    color: "#F472B6",
  },
  {
    emoji: "☀️",
    season: "Summer",
    months: "Jun – Aug",
    description: "Best air quality of the year, monsoon clears pollutants",
    color: "#FBBF24",
  },
  {
    emoji: "🍂",
    season: "Autumn",
    months: "Sep – Nov",
    description: "Rapidly worsening, crop burning season begins in October",
    color: "#F97316",
  },
  {
    emoji: "❄️",
    season: "Winter",
    months: "Dec – Feb",
    description: "Worst season, cold air traps pollutants close to ground",
    color: "#60A5FA",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("12m");
  const [scope, setScope] = useState<"delhi" | "india">("delhi");

  const isDelhi = scope === "delhi";

  // Pick data based on scope and time range
  const monthlyData = useMemo(
    () => (isDelhi ? DELHI_MONTHLY : INDIA_MONTHLY)[timeRange],
    [isDelhi, timeRange],
  );

  const pollutantData = useMemo(
    () => (isDelhi ? DELHI_POLLUTANTS : INDIA_POLLUTANTS)[timeRange],
    [isDelhi, timeRange],
  );

  // Compute worst and best months from the 12-month data
  const fullYearData = (isDelhi ? DELHI_MONTHLY : INDIA_MONTHLY)["12m"];
  const worstMonth = fullYearData.reduce((prev, curr) =>
    curr.aqi > prev.aqi ? curr : prev,
  );
  const bestMonth = fullYearData.reduce((prev, curr) =>
    curr.aqi < prev.aqi ? curr : prev,
  );
  const worstCategory = getNAQICategory(worstMonth.aqi);
  const bestCategory = getNAQICategory(bestMonth.aqi);

  return (
    <DashboardLayout>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <header
        id="trends-header"
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
              Air Quality Trends
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            See how air quality in your city has changed over time
          </p>
        </div>

        {/* City / India toggle */}
        <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setScope("delhi")}
            className={`px-4 py-2 text-xs font-medium transition-all duration-200 ${
              isDelhi
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Delhi
          </button>
          <button
            type="button"
            onClick={() => setScope("india")}
            className={`px-4 py-2 text-xs font-medium transition-all duration-200 ${
              !isDelhi
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            India Avg
          </button>
        </div>
      </header>

      {/* ── Time Range Tabs ────────────────────────────────────────────────── */}
      <section id="section-time-range" className="mb-8">
        <div className="flex items-center gap-1 flex-wrap">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              type="button"
              onClick={() => setTimeRange(range.key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                timeRange === range.key
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Monthly AQI Trend Chart ────────────────────────────────────────── */}
      <section id="section-monthly-trend" className="mb-6">
        <MonthlyTrendChart data={monthlyData} />
      </section>

      {/* ── Worst & Best Months Card ───────────────────────────────────────── */}
      <section id="section-worst-best" className="mb-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            <Calendar className="h-3.5 w-3.5" />
            Annual Highlights
          </h3>

          <div className="space-y-3">
            {/* Worst month */}
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">Worst Month:</span>{" "}
                {worstMonth.month} — Avg AQI {worstMonth.aqi}
              </span>
              {worstCategory && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: hexToRgba(worstCategory.colorHex, 0.12),
                    color: worstCategory.colorHex,
                  }}
                >
                  {worstCategory.category}
                </span>
              )}
            </div>

            {/* Best month */}
            <div className="flex items-center gap-3">
              <ArrowDownRight className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">Best Month:</span>{" "}
                {bestMonth.month} — Avg AQI {bestMonth.aqi}
              </span>
              {bestCategory && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: hexToRgba(bestCategory.colorHex, 0.12),
                    color: bestCategory.colorHex,
                  }}
                >
                  {bestCategory.category}
                </span>
              )}
            </div>

            {/* Most improved */}
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-sky-500 shrink-0" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">Most Improved:</span> June vs
                last year —{" "}
                <span className="text-emerald-500 font-semibold">
                  12% better
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pollutant Trends Chart ─────────────────────────────────────────── */}
      <section id="section-pollutant-trends" className="mb-6">
        <PollutantTrendChart data={pollutantData} />
      </section>

      {/* ── Year-Over-Year Comparison ──────────────────────────────────────── */}
      <section id="section-year-comparison" className="mb-6">
        <YearComparisonChart
          data={YEAR_COMPARISON_DATA}
          summary={`${isDelhi ? "Delhi's" : "India's"} air quality has worsened by 8% compared to 2022`}
        />
      </section>

      {/* ── Seasonal Insight Card ──────────────────────────────────────────── */}
      <section id="section-seasonal-insights" className="mb-8">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            <Leaf className="h-3.5 w-3.5" />
            Seasonal Patterns
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SEASONAL_INSIGHTS.map((insight) => (
              <div
                key={insight.season}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5 transition-all duration-200 hover:bg-muted/40"
              >
                <span className="text-xl leading-none mt-0.5" aria-hidden>
                  {insight.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {insight.season}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {insight.months}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Historical data shown is mock data for demonstration · Based on CPCB
        NAQI methodology · Real-time trends coming soon
      </div>
    </DashboardLayout>
  );
}
