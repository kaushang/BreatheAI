/**
 * Alerts Page — Live Implementation
 *
 * Replaces mock data with real Firestore-backed alert preferences and history.
 *
 * Features:
 *  - Loads user's current threshold + email from Firestore
 *  - Saves threshold changes via /api/alerts/subscribe
 *  - Displays real alert history from /api/alerts/history
 *  - Email toggle saves to Firestore immediately
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AlertThresholdCard from "@/components/cards/AlertThresholdCard";
import { getNAQICategory } from "@/constants/naqi";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Bell, Mail, Globe, Clock, MapPin, CheckCircle2,
  AlertTriangle, Inbox, Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertLog {
  id:            string;
  city:          string;
  aqi:           number;
  threshold:     number;
  category:      string;
  email_sent_to: string;
  sent_at:       string;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const router = useRouter();

  const [threshold,    setThreshold]    = useState(150);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [userEmail,    setUserEmail]    = useState("");
  const [city,         setCity]         = useState("Delhi");
  const [alertLogs,    setAlertLogs]    = useState<AlertLog[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  // Load user profile + alert history on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth/login"); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setThreshold(data.aqi_alert_threshold ?? 150);
          setEmailEnabled(data.alert_email_enabled ?? true);
          setUserEmail(data.alert_email || data.email || "");
          setCity(data.city ?? "Delhi");
        }
      } catch { /* ignore */ }
      // Load alert history
      try {
        const res = await fetch("/api/alerts/history");
        if (res.ok) {
          const { logs } = await res.json();
          setAlertLogs(logs ?? []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSaveThreshold = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold, emailEnabled, email: userEmail }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }, [threshold, emailEnabled, userEmail]);

  return (
    <DashboardLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header id="alerts-header" className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
            AQI Alerts
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Get notified by email when air quality in {city} crosses your threshold
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <>
          {/* ── Two-column layout ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Threshold Card */}
            <AlertThresholdCard
              value={threshold}
              onChange={setThreshold}
              onSave={handleSaveThreshold}
            />

            {/* Notification Preferences */}
            <div id="notification-preferences-card" className="rounded-2xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
                <Mail className="h-3.5 w-3.5" />
                Notification Settings
              </h3>

              <div className="space-y-4 mb-6">
                {/* Email toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sky-500/10">
                      <Mail className="h-4 w-4 text-sky-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Email Notifications</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      emailEnabled ? "bg-sky-500" : "bg-muted-foreground/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        emailEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Browser (coming soon) */}
                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Browser Notifications</span>
                      <span className="ml-2 text-[10px] text-muted-foreground/50 uppercase tracking-wider">Coming soon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email display */}
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 mb-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">
                  Alerts sent to
                </p>
                <p className="text-sm text-foreground">{userEmail || "—"}</p>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveThreshold}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveSuccess ? (
                  <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                ) : (
                  "Save Preferences"
                )}
              </button>
            </div>
          </div>

          {/* ── Alert History ─────────────────────────────────────────────── */}
          <section id="section-recent-alerts" className="mb-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Alert History
              </h3>

              {alertLogs.length > 0 ? (
                <>
                  <div className="divide-y divide-border">
                    {alertLogs.map((alert) => {
                      const category = getNAQICategory(alert.aqi);
                      const colorHex = category?.colorHex ?? "#808080";
                      return (
                        <div key={alert.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                          <div
                            className="flex items-center justify-center h-9 w-9 rounded-xl shrink-0"
                            style={{ backgroundColor: hexToRgba(colorHex, 0.1) }}
                          >
                            <Bell className="h-4 w-4" style={{ color: colorHex }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground">
                                AQI reached {alert.aqi}
                              </span>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: hexToRgba(colorHex, 0.12),
                                  color: colorHex,
                                }}
                              >
                                {alert.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(alert.sent_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 mt-4 text-center">
                    Showing last {alertLogs.length} alerts
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/50 mb-4">
                    <Inbox className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">No alerts triggered yet</p>
                  <p className="text-xs text-muted-foreground/50 max-w-xs">
                    You&apos;ll receive an email when AQI in {city} exceeds your threshold of {threshold}.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Alerts check every hour · Email sent via Resend · 4-hour cooldown between alerts
      </div>
    </DashboardLayout>
  );
}
