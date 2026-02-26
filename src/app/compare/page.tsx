/**
 * Compare Cities Page
 *
 * Allows users to compare AQI readings across multiple Indian cities side-by-side.
 * Includes:
 *   1. Page header — "Compare Cities" heading + subheading
 *   2. City selector row with searchable dropdowns (2–4 cities)
 *   3. Current AQI comparison cards — one per city, best highlighted green, worst red
 *   4. Comparison chart — grouped bar chart with metric toggle
 *   5. Pollutants comparison table — color-coded by NAQI breakpoints
 *
 * All data is hardcoded mock data for now — no backend connection.
 */

"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CitySelectorCard from "@/components/cards/CitySelectorCard";
import ComparisonChart from "@/components/charts/ComparisonChart";
import PollutantsComparisonTable from "@/components/charts/PollutantsComparisonTable";
import { getNAQICategory } from "@/constants/naqi";
import { GitCompareArrows, Wind } from "lucide-react";
import type { CityComparisonData } from "@/components/charts/ComparisonChart";

// ─── Mock Data ───────────────────────────────────────────────────────────────

/** Hardcoded AQI and pollutant data for each city */
const MOCK_CITY_DATA: Record<
  string,
  CityComparisonData & { dominantPollutant: string }
> = {
  Delhi: {
    city: "Delhi",
    aqi: 168,
    pm25: 98,
    pm10: 145,
    no2: 52,
    dominantPollutant: "PM2.5",
  },
  Mumbai: {
    city: "Mumbai",
    aqi: 89,
    pm25: 45,
    pm10: 78,
    no2: 31,
    dominantPollutant: "PM10",
  },
  Bengaluru: {
    city: "Bengaluru",
    aqi: 62,
    pm25: 28,
    pm10: 54,
    no2: 18,
    dominantPollutant: "PM2.5",
  },
  Chennai: {
    city: "Chennai",
    aqi: 110,
    pm25: 61,
    pm10: 95,
    no2: 40,
    dominantPollutant: "PM2.5",
  },
  // Fallback data for cities not in the mock set
  Kolkata: {
    city: "Kolkata",
    aqi: 155,
    pm25: 85,
    pm10: 130,
    no2: 48,
    dominantPollutant: "PM2.5",
  },
  Hyderabad: {
    city: "Hyderabad",
    aqi: 78,
    pm25: 38,
    pm10: 65,
    no2: 25,
    dominantPollutant: "PM10",
  },
  Ahmedabad: {
    city: "Ahmedabad",
    aqi: 132,
    pm25: 72,
    pm10: 110,
    no2: 44,
    dominantPollutant: "PM2.5",
  },
  Pune: {
    city: "Pune",
    aqi: 95,
    pm25: 50,
    pm10: 82,
    no2: 35,
    dominantPollutant: "PM2.5",
  },
  Jaipur: {
    city: "Jaipur",
    aqi: 142,
    pm25: 78,
    pm10: 125,
    no2: 46,
    dominantPollutant: "PM10",
  },
  Lucknow: {
    city: "Lucknow",
    aqi: 175,
    pm25: 102,
    pm10: 155,
    no2: 55,
    dominantPollutant: "PM2.5",
  },
};

/** Generate fallback mock data for any city not in the lookup */
function getCityData(
  cityName: string,
): CityComparisonData & { dominantPollutant: string } {
  if (MOCK_CITY_DATA[cityName]) return MOCK_CITY_DATA[cityName];

  // Generate deterministic-ish mock data from city name length
  const seed = cityName.length * 17;
  const aqi = 50 + (seed % 180);
  return {
    city: cityName,
    aqi,
    pm25: Math.round(aqi * 0.55),
    pm10: Math.round(aqi * 0.85),
    no2: Math.round(aqi * 0.28),
    dominantPollutant: "PM2.5",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ComparePage() {
  const [selectedCities, setSelectedCities] = useState<string[]>([
    "Delhi",
    "Mumbai",
  ]);

  // Derive data for all selected cities
  const cityDataList = useMemo(
    () => selectedCities.map(getCityData),
    [selectedCities],
  );

  // Find best (lowest AQI) and worst (highest AQI) cities
  const bestAqi = Math.min(...cityDataList.map((c) => c.aqi));
  const worstAqi = Math.max(...cityDataList.map((c) => c.aqi));

  // Chart data (without dominantPollutant field, just what the chart needs)
  const chartData: CityComparisonData[] = cityDataList.map(
    ({ city, aqi, pm25, pm10, no2 }) => ({ city, aqi, pm25, pm10, no2 }),
  );

  return (
    <DashboardLayout>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <header id="compare-header" className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
            Compare Cities
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Compare air quality across multiple Indian cities side by side
        </p>
      </header>

      {/* ── City Selector ──────────────────────────────────────────────────── */}
      <section id="section-city-selector" className="mb-8">
        <CitySelectorCard
          selectedCities={selectedCities}
          onChange={setSelectedCities}
        />
      </section>

      {/* ── Current AQI Comparison Cards ───────────────────────────────────── */}
      <section id="section-aqi-cards" className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Current Air Quality
        </h2>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(cityDataList.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {cityDataList.map((cityData) => {
            const category = getNAQICategory(cityData.aqi);
            const colorHex = category?.colorHex ?? "#808080";
            const categoryName = category?.category ?? "Unknown";

            // Subtle tint: green for best, red for worst, neutral otherwise
            const isBest = cityData.aqi === bestAqi && cityDataList.length > 1;
            const isWorst =
              cityData.aqi === worstAqi && cityDataList.length > 1;

            let cardBg = "transparent";
            let cardBorder = "hsl(var(--border))";

            if (isBest) {
              cardBg = "rgba(0, 153, 102, 0.05)";
              cardBorder = "rgba(0, 153, 102, 0.2)";
            } else if (isWorst) {
              cardBg = "rgba(204, 0, 51, 0.04)";
              cardBorder = "rgba(204, 0, 51, 0.18)";
            }

            return (
              <div
                key={cityData.city}
                className="rounded-2xl border p-5 transition-all duration-300"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                }}
              >
                {/* City name */}
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {cityData.city}
                </h3>

                {/* Large AQI number */}
                <div
                  className="text-4xl sm:text-5xl font-bold font-heading tracking-tight leading-none mb-3 transition-colors duration-300"
                  style={{ color: colorHex }}
                >
                  {cityData.aqi}
                </div>

                {/* Category badge */}
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3"
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

                {/* Dominant pollutant */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wind className="h-3 w-3" />
                  <span>
                    Dominant:{" "}
                    <span className="font-medium text-foreground">
                      {cityData.dominantPollutant}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison Chart ───────────────────────────────────────────────── */}
      <section id="section-comparison-chart" className="mb-8">
        <ComparisonChart data={chartData} />
      </section>

      {/* ── Pollutants Comparison Table ─────────────────────────────────────── */}
      <section id="section-pollutants-table" className="mb-8">
        <PollutantsComparisonTable data={chartData} />
      </section>

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Data shown is hardcoded mock data for demonstration · CPCB NAQI
        methodology · Real-time data coming soon
      </div>
    </DashboardLayout>
  );
}
