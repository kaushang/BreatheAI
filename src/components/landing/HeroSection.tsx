/**
 * Hero Section — Landing Page
 *
 * Contains the main value proposition with:
 * - Large bold heading: "Know Your Air. Protect Your Health."
 * - Subheading explaining the product
 * - "Get Started for Free" CTA button
 * - Social proof line: "Covering 40+ Indian cities"
 * - Mock AQI card on the right matching the real dashboard card design
 */

import Link from "next/link";
import { MapPin, Wind, Radio } from "lucide-react";

/** Hardcoded mock AQI data for the hero preview card */
const MOCK_AQI = {
  value: 156,
  category: "Poor",
  colorHex: "#CC0033",
  city: "Delhi",
  area: "Anand Vihar",
  dominantPollutant: "PM2.5",
  source: "CPCB",
};

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function HeroSection() {
  const { value, category, colorHex, city, area, dominantPollutant, source } =
    MOCK_AQI;

  return (
    <section id="hero" className="relative overflow-hidden bg-background">
      {/* Subtle background gradient blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#38BDF8]/[0.04] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#38BDF8]/[0.03] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* ── Left: Copy ──────────────────────────────────────────── */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-[family-name:var(--font-outfit)]">
              Know Your Air. <br className="hidden sm:inline" />
              <span className="text-[#38BDF8]">Protect Your Health.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Hyperlocal AQI predictions, personalized health advice, and
              real-time air quality data — built for India.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
              <Link
                href="/auth/signup"
                className="rounded-xl bg-[#38BDF8] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#38BDF8]/20 hover:bg-[#38BDF8]/90 hover:shadow-xl hover:shadow-[#38BDF8]/25 transition-all duration-200"
              >
                Get Started for Free
              </Link>
            </div>

            {/* Social proof */}
            <p className="mt-5 text-sm text-muted-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Covering 40+ Indian cities
              </span>
            </p>
          </div>

          {/* ── Right: Mock AQI Card ────────────────────────────────── */}
          <div className="flex justify-center lg:justify-end">
            <div
              id="hero-aqi-preview-card"
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border p-6 sm:p-8 transition-all duration-500"
              style={{
                backgroundColor: hexToRgba(colorHex, 0.08),
                borderColor: hexToRgba(colorHex, 0.2),
              }}
            >
              {/* Decorative circle */}
              <div
                className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-[0.06]"
                style={{ backgroundColor: colorHex }}
              />

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
                  className="font-[family-name:var(--font-outfit)] text-7xl sm:text-8xl font-bold tracking-tight leading-none"
                  style={{ color: colorHex }}
                >
                  {value}
                </div>

                {/* Category badge */}
                <div
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
                  style={{
                    backgroundColor: hexToRgba(colorHex, 0.12),
                    color: colorHex,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorHex }}
                  />
                  {category}
                </div>

                {/* Dominant pollutant */}
                <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Wind className="h-3.5 w-3.5" />
                  <span>
                    Dominant pollutant:{" "}
                    <span className="font-medium text-foreground">
                      {dominantPollutant}
                    </span>
                  </span>
                </div>

                {/* Location */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {area}, {city}
                  </span>
                </div>

                {/* Source */}
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                  <Radio className="h-2.5 w-2.5" />
                  <span>Source: {source}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
