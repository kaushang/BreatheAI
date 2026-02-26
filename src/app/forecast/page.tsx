/**
 * Forecast Page
 *
 * Displays the 48-hour AQI forecast for the user's location.
 * Includes:
 *   1. Page header with city/area and last updated timestamp
 *   2. 48-hour forecast line chart (ForecastChart)
 *   3. Best time to go outside timeline (BestTimeCard)
 *   4. Hourly forecast table — 3-hour intervals (HourlyForecastCard)
 *   5. Tomorrow's forecast summary card (TomorrowSummaryCard)
 *
 * All data is hardcoded mock data for now — no backend connection.
 */

"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ForecastChart, {
  mockForecastData,
} from "@/components/charts/ForecastChart";
import BestTimeCard from "@/components/cards/BestTimeCard";
import HourlyForecastCard from "@/components/cards/HourlyForecastCard";
import TomorrowSummaryCard from "@/components/cards/TomorrowSummaryCard";
import { MapPin, Clock, CalendarDays } from "lucide-react";

// ─── Derive data for child components from mock forecast ─────────────────────

// Today's 24-hour data for BestTimeCard
const todayHourlyData = mockForecastData.slice(0, 24).map((d) => ({
  hour: d.hour,
  label: d.time,
  aqi: d.aqi,
}));

// Dominant pollutants (mocked per hour for realism)
const pollutants = [
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM10",
  "PM10",
  "PM10",
  "PM10",
  "O3",
  "O3",
  "O3",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "NO2",
  "NO2",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM10",
  "PM10",
  "PM10",
  "PM10",
  "O3",
  "O3",
  "O3",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "NO2",
  "NO2",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
  "PM2.5",
];

// Full 48-hour slots for HourlyForecastCard
const forecastSlots = mockForecastData.map((d, i) => ({
  ...d,
  dominantPollutant: pollutants[i] || "PM2.5",
}));

// Tomorrow's summary stats (hours 24–47)
const tomorrowData = mockForecastData.slice(24);
const tomorrowAvg = Math.round(
  tomorrowData.reduce((sum, d) => sum + d.aqi, 0) / tomorrowData.length,
);
const tomorrowPeak = Math.max(...tomorrowData.map((d) => d.aqi));
const tomorrowLow = Math.min(...tomorrowData.map((d) => d.aqi));

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ForecastPage() {
  return (
    <DashboardLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header
        id="forecast-header"
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
              48-Hour Forecast
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>Anand Vihar, Delhi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Clock className="h-3 w-3" />
          <span>Last updated: Today, 5:30 PM IST</span>
        </div>
      </header>

      {/* ── Forecast Chart ───────────────────────────────────────────────── */}
      <section id="section-forecast-chart" className="mb-6">
        <ForecastChart alertThreshold={150} />
      </section>

      {/* ── Best Time + Tomorrow Summary (side by side on desktop) ────── */}
      <section
        id="section-best-time-tomorrow"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
      >
        <BestTimeCard todayHourlyData={todayHourlyData} />
        <TomorrowSummaryCard
          averageAqi={tomorrowAvg}
          peakAqi={tomorrowPeak}
          lowAqi={tomorrowLow}
        />
      </section>

      {/* ── Hourly Forecast Table ────────────────────────────────────────── */}
      <section id="section-hourly-table" className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Detailed Hourly Breakdown
        </h2>
        <HourlyForecastCard slots={forecastSlots} />
      </section>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Forecast generated using ML-based AQI prediction model · CPCB NAQI
        methodology · Mock data for demonstration
      </div>
    </DashboardLayout>
  );
}
