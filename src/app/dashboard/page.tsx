/**
 * Dashboard Page
 *
 * Main dashboard view with skeleton placeholders for all sections.
 * Fetches the user's profile from Supabase and shows a greeting.
 *
 * Sections:
 *   1. Header — "Good morning, [name]" + city/area on the right
 *   2. Main AQI Card — large skeleton placeholder
 *   3. Pollutants Grid — 6 skeleton boxes in 3×2 grid (PM2.5, PM10, NO2, SO2, CO, O3)
 *   4. Health Advice Card — skeleton placeholder
 *   5. Best Time to Go Outside — wide skeleton bar
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MapPin, Loader2 } from "lucide-react";

// ─── Profile type ────────────────────────────────────────────────────────────

interface UserProfileData {
  full_name: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  health_conditions: string[];
}

// ─── Pollutant labels ────────────────────────────────────────────────────────

const POLLUTANTS = ["PM2.5", "PM10", "NO₂", "SO₂", "CO", "O₃"] as const;

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

  // ── Greeting helper ──────────────────────────────────────────────────────
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

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

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {profileLoading ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <>
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {profile?.area}, {profile?.city}
              </span>
            </>
          )}
        </div>
      </header>

      {/* ── Main AQI Card ───────────────────────────────────────────────── */}
      <section id="section-aqi-card" className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Air Quality Index
        </h2>
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-32 rounded-xl" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </section>

      {/* ── Pollutants Grid ─────────────────────────────────────────────── */}
      <section id="section-pollutants" className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Pollutant Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {POLLUTANTS.map((name) => (
            <div
              key={name}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {name}
              </p>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Health Advice Card ──────────────────────────────────────────── */}
      <section id="section-health-advice" className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Health Advisory
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      </section>

      {/* ── Best Time to Go Outside ────────────────────────────────────── */}
      <section id="section-best-time" className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Best Time to Go Outside
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer note ────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Data sourced from WAQI / CPCB monitoring network · Updated in real-time
      </div>
    </DashboardLayout>
  );
}
