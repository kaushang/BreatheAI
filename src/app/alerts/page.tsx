/**
 * Alerts Page
 *
 * AQI alert management view.
 * Includes:
 *   1. Page header — "AQI Alerts" heading + subheading
 *   2. Alert Threshold Card — slider to set threshold with NAQI badge
 *   3. Notification Preference Card — email/browser toggles
 *   4. Active Alerts Card — recent alert history
 *
 * All data is hardcoded mock data for now — no backend connection.
 */

"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AlertThresholdCard from "@/components/cards/AlertThresholdCard";
import { getNAQICategory } from "@/constants/naqi";
import {
  Bell,
  Mail,
  Globe,
  Clock,
  MapPin,
  Pencil,
  AlertTriangle,
  Inbox,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface MockAlert {
  id: string;
  dateTime: string;
  aqi: number;
  location: string;
}

const MOCK_ALERTS: MockAlert[] = [
  {
    id: "a1",
    dateTime: "Yesterday, 3:45 PM",
    aqi: 187,
    location: "Anand Vihar, Delhi",
  },
  {
    id: "a2",
    dateTime: "2 days ago, 11:20 AM",
    aqi: 215,
    location: "Anand Vihar, Delhi",
  },
  {
    id: "a3",
    dateTime: "Last week, 6:00 PM",
    aqi: 162,
    location: "Anand Vihar, Delhi",
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [threshold, setThreshold] = useState(150);
  const [emailNotif, setEmailNotif] = useState(true);
  const [browserNotif, setBrowserNotif] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true); // toggle to demo empty state

  function handleSaveThreshold() {
    console.log("Threshold saved:", threshold);
  }

  return (
    <DashboardLayout>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <header id="alerts-header" className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
            AQI Alerts
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Get notified when air quality crosses your threshold
        </p>
      </header>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── Alert Threshold Card ──────────────────────────────────────── */}
        <AlertThresholdCard
          value={threshold}
          onChange={setThreshold}
          onSave={handleSaveThreshold}
        />

        {/* ── Notification Preferences Card ─────────────────────────────── */}
        <div
          id="notification-preferences-card"
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            <Mail className="h-3.5 w-3.5" />
            How to Notify Me
          </h3>

          <div className="space-y-4 mb-6">
            {/* Email toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sky-500/10">
                  <Mail className="h-4 w-4 text-sky-500" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Email Notifications
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  emailNotif ? "bg-sky-500" : "bg-muted-foreground/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    emailNotif ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Browser toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Browser Notifications
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBrowserNotif(!browserNotif)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  browserNotif ? "bg-sky-500" : "bg-muted-foreground/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    browserNotif ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Email display */}
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                  Notification email
                </p>
                <p className="text-sm text-foreground">user@example.com</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-sky-500 font-medium hover:text-sky-600 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Alerts Card ──────────────────────────────────────────────── */}
      <section id="section-recent-alerts" className="mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Recent Alerts
            </h3>
            {/* Demo toggle for empty state */}
            <button
              type="button"
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {showAlerts ? "Show empty state" : "Show alerts"}
            </button>
          </div>

          {showAlerts && MOCK_ALERTS.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {MOCK_ALERTS.map((alert) => {
                  const category = getNAQICategory(alert.aqi);
                  const colorHex = category?.colorHex ?? "#808080";
                  const categoryName = category?.category ?? "Unknown";

                  return (
                    <div
                      key={alert.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {/* Alert icon indicator */}
                      <div
                        className="flex items-center justify-center h-9 w-9 rounded-xl shrink-0"
                        style={{
                          backgroundColor: hexToRgba(colorHex, 0.1),
                        }}
                      >
                        <Bell className="h-4 w-4" style={{ color: colorHex }} />
                      </div>

                      {/* Content */}
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
                            {categoryName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.dateTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-4 text-center">
                Showing last {MOCK_ALERTS.length} alerts
              </p>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/50 mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                No alerts triggered yet
              </p>
              <p className="text-xs text-muted-foreground/50 max-w-xs">
                You&apos;ll be notified when AQI crosses your threshold.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Alerts are generated based on real-time AQI data · Email notifications
        via Resend · Mock data for demonstration
      </div>
    </DashboardLayout>
  );
}
