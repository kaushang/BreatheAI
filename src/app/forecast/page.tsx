/**
 * Forecast Page — Live Implementation
 *
 * Fetches live 48-hour AQI forecast from /api/forecast/[city] (which proxies
 * the Python ML ensemble service) and passes real data to all forecast cards.
 *
 * Falls back gracefully to a "ML service offline" message if the Python
 * service isn't running yet.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ForecastChart from "@/components/charts/ForecastChart";
import BestTimeCard from "@/components/cards/BestTimeCard";
import HourlyForecastCard from "@/components/cards/HourlyForecastCard";
import TomorrowSummaryCard from "@/components/cards/TomorrowSummaryCard";
import { MapPin, Clock, CalendarDays, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForecastSlot {
  hour:               number;
  timestamp:          string;
  aqi:                number;
  category:           string;
  color:              string;
  confidence:         number;
  dominant_pollutant: string;
}

interface ForecastResponse {
  city:        string;
  lat:         number;
  lng:         number;
  hours:       number;
  current_aqi: number;
  forecast:    ForecastSlot[];
  model:       string;
  cached:      boolean;
}

interface UserProfile {
  city: string;
  area: string;
  lat:  number;
  lng:  number;
  aqi_alert_threshold: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert ML forecast slots → shape expected by ForecastChart */
function toChartData(slots: ForecastSlot[]): { hour: number; aqi: number; time: string; day: string; fullTime: string }[] {
  return slots.map((s) => {
    const d = new Date(s.timestamp);
    const hourLabel = d.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });
    const dayLabel  = d.toLocaleDateString("en-IN", { weekday: "short" });
    return {
      hour:     s.hour,
      aqi:      s.aqi,
      time:     hourLabel,
      day:      dayLabel,
      fullTime: d.toLocaleString("en-IN"),
    };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForecastPage() {
  const router = useRouter();

  const [profile,   setProfile]   = useState<UserProfile | null>(null);
  const [forecast,  setForecast]  = useState<ForecastResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [mlOffline, setMlOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 1. Load user profile from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth/login"); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } catch { /* ignore */ }
    });
    return () => unsub();
  }, [router]);

  // 2. Fetch forecast once profile is loaded
  useEffect(() => {
    if (!profile) return;
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function fetchForecast() {
    if (!profile) return;
    setLoading(true);
    setMlOffline(false);
    try {
      const res = await fetch(
        `/api/forecast/${encodeURIComponent(profile.city)}?lat=${profile.lat}&lng=${profile.lng}&hours=48`
      );
      if (!res.ok) {
        if (res.status === 503) { setMlOffline(true); return; }
        throw new Error(`Forecast API error: ${res.status}`);
      }
      const data: ForecastResponse = await res.json();
      setForecast(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[Forecast] Error:", err);
      setMlOffline(true);
    } finally {
      setLoading(false);
    }
  }

  // ── Derived data from forecast ─────────────────────────────────────────────
  const chartData     = forecast ? toChartData(forecast.forecast) : [];
  const todayHourly   = chartData.slice(0, 24).map((d) => ({ hour: d.hour, label: d.time, aqi: d.aqi }));
  const forecastSlots = forecast?.forecast.map((s, i) => ({
    ...chartData[i],
    dominantPollutant: s.dominant_pollutant.toUpperCase(),
  })) ?? [];

  const tomorrowSlots = forecast?.forecast.slice(24) ?? [];
  const tomorrowAvg   = tomorrowSlots.length ? Math.round(tomorrowSlots.reduce((s, d) => s + d.aqi, 0) / tomorrowSlots.length) : 0;
  const tomorrowPeak  = tomorrowSlots.length ? Math.max(...tomorrowSlots.map((d) => d.aqi)) : 0;
  const tomorrowLow   = tomorrowSlots.length ? Math.min(...tomorrowSlots.map((d) => d.aqi)) : 0;

  const threshold = profile?.aqi_alert_threshold ?? 150;

  // ── Render ─────────────────────────────────────────────────────────────────
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
              <span>{profile ? `${profile.area || profile.city}, ${profile.city}` : "Loading…"}</span>
            </div>
            {forecast?.model && (
              <span className="text-[11px] text-muted-foreground/50 hidden sm:block">
                · {forecast.model}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              <span>Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
            </div>
          )}
          <button
            onClick={fetchForecast}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-muted-foreground/40 hover:text-foreground disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* ── ML Offline Banner ─────────────────────────────────────────────── */}
      {mlOffline && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3 text-sm text-orange-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div>
            <strong>ML service offline.</strong> Start it with:{" "}
            <code className="rounded bg-orange-500/10 px-1.5 py-0.5 text-xs font-mono">
              cd ml-service &amp;&amp; uvicorn main:app --port 8001
            </code>
          </div>
        </div>
      )}

      {/* ── Loading spinner ───────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      )}

      {/* ── Forecast Content ──────────────────────────────────────────────── */}
      {!loading && forecast && (
        <>
          {/* Chart */}
          <section id="section-forecast-chart" className="mb-6">
            <ForecastChart alertThreshold={threshold} forecastData={chartData} />
          </section>

          {/* Best Time + Tomorrow Summary */}
          <section id="section-best-time-tomorrow" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BestTimeCard todayHourlyData={todayHourly} />
            <TomorrowSummaryCard
              averageAqi={tomorrowAvg}
              peakAqi={tomorrowPeak}
              lowAqi={tomorrowLow}
            />
          </section>

          {/* Hourly breakdown */}
          <section id="section-hourly-table" className="mb-8">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Detailed Hourly Breakdown
            </h2>
            <HourlyForecastCard slots={forecastSlots} />
          </section>
        </>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Forecast generated using ensemble ML model (SARIMA diurnal + LightGBM weather corrections) ·
        CPCB NAQI methodology
      </div>
    </DashboardLayout>
  );
}
