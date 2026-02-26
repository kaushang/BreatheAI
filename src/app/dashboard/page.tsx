/**
 * Dashboard Page
 *
 * Main dashboard view that fetches live AQI data and displays:
 *   1. Header — "Good morning, [name]" + city/area on the right
 *   2. Main AQI Card — live AQI with color-coded category
 *   3. Pollutants Grid — individual pollutant concentrations
 *   4. Health Advice Card — personalized advisory based on AQI + health profile
 *   5. Best Time to Go Outside — placeholder for future forecast integration
 *
 * Uses the useAQI hook to fetch live data from /api/aqi/current,
 * and renders skeleton loaders while data is being fetched.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AQICard, PollutantsCard, HealthAdviceCard } from "@/components/cards";
import { useAQI } from "@/hooks/useAQI";
import { MapPin, RefreshCw, AlertCircle, Clock } from "lucide-react";

// ─── Profile type ────────────────────────────────────────────────────────────

interface UserProfileData {
  full_name: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  health_conditions: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Fetch user profile on mount ──────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, city, area, lat, lng, health_conditions")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as UserProfileData);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Fetch live AQI using the user's coordinates ──────────────────────────
  const {
    data: aqiData,
    loading: aqiLoading,
    error: aqiError,
    refetch: refetchAQI,
  } = useAQI(profile?.lat ?? null, profile?.lng ?? null);

  // ── Greeting helper ──────────────────────────────────────────────────────
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  // ── Derived loading state ────────────────────────────────────────────────
  const isLoading = profileLoading || aqiLoading;

  return (
    <DashboardLayout>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        id="dashboard-header"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8"
      >
        <div>
          {profileLoading ? (
            <Skeleton className="h-7 w-56 mb-1" />
          ) : (
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
              {greeting}, {firstName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {profileLoading ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {profile?.area}, {profile?.city}
              </span>
            </div>
          )}

          {/* Refresh button */}
          {!profileLoading && (
            <button
              onClick={refetchAQI}
              disabled={aqiLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh AQI data"
            >
              <RefreshCw
                className={`h-3 w-3 ${aqiLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          )}
        </div>
      </header>

      {/* ── Error State ─────────────────────────────────────────────────── */}
      {aqiError && !aqiLoading && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-destructive mb-1">
                Unable to fetch AQI data
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{aqiError}</p>
              <button
                onClick={refetchAQI}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main AQI Card ───────────────────────────────────────────────── */}
      <section id="section-aqi-card" className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Air Quality Index
        </h2>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-32 rounded-xl" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ) : aqiData ? (
          <AQICard reading={aqiData} />
        ) : null}
      </section>

      {/* ── Pollutants Grid ─────────────────────────────────────────────── */}
      <section id="section-pollutants" className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Pollutant Breakdown
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : aqiData ? (
          <PollutantsCard pollutants={aqiData.pollutants} />
        ) : null}
      </section>

      {/* ── Health Advice Card ──────────────────────────────────────────── */}
      <section id="section-health-advice" className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Health Advisory
        </h2>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-44" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        ) : aqiData ? (
          <HealthAdviceCard
            aqi={aqiData.aqi}
            healthConditions={profile?.health_conditions ?? []}
          />
        ) : null}
      </section>

      {/* ── Best Time to Go Outside ────────────────────────────────────── */}
      <section id="section-best-time" className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Best Time to Go Outside
        </h2>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <div className="flex justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Forecast coming soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We&apos;re working on integrating hourly AQI forecasts so you can
              plan the best time for outdoor activities. Stay tuned!
            </p>
          </div>
        )}
      </section>

      {/* ── Footer note ────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Data sourced from WAQI / CPCB monitoring network · Updated in real-time
      </div>
    </DashboardLayout>
  );
}
