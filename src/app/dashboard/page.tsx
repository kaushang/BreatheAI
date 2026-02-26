/**
 * Dashboard Page
 *
 * Main dashboard view showing real-time AQI data for the user's selected city/area.
 * On load, fetches the user's profile from Supabase to get their coordinates,
 * then uses the useAQI hook to stream live AQI data from the WAQI API.
 *
 * Sections:
 *   1. Top bar — user name, city + area, settings link
 *   2. AQI Card — large AQI value, category, dominant pollutant, station name
 *   3. Pollutants Card — grid of individual pollutant values
 *   4. Health Advice Card — personalized advisory based on AQI + health conditions
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAQI } from "@/hooks/useAQI";
import AQICard from "@/components/cards/AQICard";
import PollutantsCard from "@/components/cards/PollutantsCard";
import HealthAdviceCard from "@/components/cards/HealthAdviceCard";
import {
  Settings,
  RefreshCw,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Profile type (subset of the full profiles table) ────────────────────────

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

  // ── Profile state ──────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── AQI data via hook ──────────────────────────────────────────────────
  const {
    data: aqiData,
    loading: aqiLoading,
    error: aqiError,
    refetch,
  } = useAQI(profile?.lat ?? null, profile?.lng ?? null);

  // ── Fetch user profile on mount ────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      console.log("[Dashboard] Fetching authenticated user…");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("[Dashboard] Auth error:", authError);
        router.push("/auth/login");
        return;
      }

      if (!user) {
        console.warn("[Dashboard] No user found, redirecting to login.");
        router.push("/auth/login");
        return;
      }

      console.log("[Dashboard] Authenticated user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, city, area, lat, lng, health_conditions")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[Dashboard] Profile fetch error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        // PGRST116 = "JSON object requested, multiple (or no) rows returned"
        // This means no profile row exists yet for this user.
        if (error.code === "PGRST116") {
          setProfileError(
            "Your profile hasn't been set up yet. This can happen if email verification is pending. " +
              "Please try logging out and signing up again, or contact support.",
          );
        } else {
          setProfileError(`Failed to load your profile: ${error.message}`);
        }
        return;
      }

      if (!data) {
        console.error("[Dashboard] Profile query returned null data");
        setProfileError(
          "Profile data is missing. Please try signing up again.",
        );
        return;
      }

      console.log("[Dashboard] Profile loaded:", {
        city: data.city,
        area: data.area,
        lat: data.lat,
        lng: data.lng,
      });

      setProfile(data as UserProfileData);
    } catch (err) {
      console.error("[Dashboard] Unexpected error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Derived state ──────────────────────────────────────────────────────
  const isLoading = profileLoading || aqiLoading;
  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // ─── Loading Skeleton ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {/* Top bar skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded-lg bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>

          {/* AQI Card skeleton */}
          <div className="rounded-2xl border border-border bg-card p-8 mb-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-20 w-28 animate-pulse rounded-xl bg-muted" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-52 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Pollutants skeleton */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-4">
            <div className="h-4 w-36 animate-pulse rounded bg-muted mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 bg-muted/30 p-4"
                >
                  <div className="h-3 w-12 animate-pulse rounded bg-muted mb-3" />
                  <div className="h-7 w-14 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-10 animate-pulse rounded bg-muted mt-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Health advice skeleton */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-muted mb-4" />
            <div className="h-5 w-48 animate-pulse rounded bg-muted mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Loading indicator text */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fetching air quality data…</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────────
  if (profileError || aqiError) {
    const errorMessage = profileError || aqiError;
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {/* Top bar (minimal) */}
          {profile && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-lg font-semibold text-foreground font-heading">
                  {getGreeting()}, {profile.full_name.split(" ")[0]}
                </h1>
              </div>
              <button
                onClick={() => router.push("/profile")}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Error card */}
          <div className="rounded-2xl border border-destructive/30 bg-destructive/[0.04] p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground font-heading">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  if (profileError) fetchProfile();
                  else refetch();
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <header
          id="dashboard-topbar"
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground font-heading">
              {getGreeting()}, {profile?.full_name.split(" ")[0] ?? "there"}
            </h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {profile?.area}, {profile?.city}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Refresh button */}
            <button
              onClick={refetch}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Refresh AQI data"
              title="Refresh"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>

            {/* Settings link */}
            <button
              onClick={() => router.push("/profile")}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Profile settings"
              title="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* ── AQI Card ────────────────────────────────────────────────── */}
        {aqiData && (
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AQICard reading={aqiData} />
          </div>
        )}

        {/* ── Pollutants Breakdown ────────────────────────────────────── */}
        {aqiData && (
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <PollutantsCard pollutants={aqiData.pollutants} />
          </div>
        )}

        {/* ── Health Advice ───────────────────────────────────────────── */}
        {aqiData && profile && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <HealthAdviceCard
              aqi={aqiData.aqi}
              healthConditions={profile.health_conditions ?? []}
            />
          </div>
        )}

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <div className="text-center text-[10px] text-muted-foreground/40 pb-8">
          Data sourced from WAQI / CPCB monitoring network · Updated in
          real-time
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns a time-of-day greeting.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
