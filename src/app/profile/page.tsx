/**
 * Profile Page
 *
 * User profile management view.
 * Includes:
 *   1. Page header — "Your Profile" heading + subheading
 *   2. Personal Info Card — full name + email (disabled) + save
 *   3. Location Card — city dropdown + area input + update
 *   4. Health Conditions Card — checklist matching signup step 3
 *   5. Danger Zone Card — delete account with confirmation dialog
 *
 * All data is hardcoded mock data for now — no backend connection.
 */

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INDIAN_CITIES } from "@/constants/cities";
import {
  User,
  MapPin,
  Heart,
  Trash2,
  Search,
  AlertTriangle,
  X,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const HEALTH_CONDITIONS = [
  { id: "none", label: "None" },
  { id: "asthma", label: "Asthma" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "elderly", label: "Elderly (60+)" },
  { id: "pregnant", label: "Pregnant" },
  { id: "child_under_12", label: "Child (under 12)" },
] as const;

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ProfilePage() {
  // Personal info
  const [fullName, setFullName] = useState("Rahul Sharma");
  const email = "rahul@example.com"; // Non-editable

  // Location
  const [city, setCity] = useState("Delhi");
  const [area, setArea] = useState("Anand Vihar");
  const [cityQuery, setCityQuery] = useState("Delhi");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Health conditions
  const [conditions, setConditions] = useState<string[]>(["asthma"]);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Close city dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target as Node)
      ) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return INDIAN_CITIES;
    const q = cityQuery.toLowerCase();
    return INDIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
    );
  }, [cityQuery]);

  function selectCity(name: string) {
    setCity(name);
    setCityQuery(name);
    setCityDropdownOpen(false);
  }

  function toggleCondition(id: string) {
    setConditions((prev) => {
      if (id === "none") {
        return prev.includes("none") ? [] : ["none"];
      }
      const withoutNone = prev.filter((c) => c !== "none");
      if (withoutNone.includes(id)) {
        return withoutNone.filter((c) => c !== id);
      }
      return [...withoutNone, id];
    });
  }

  return (
    <DashboardLayout>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <header id="profile-header" className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <User className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
            Your Profile
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your personal settings and health information
        </p>
      </header>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── Personal Info Card ────────────────────────────────────────── */}
        <div
          id="personal-info-card"
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            <User className="h-3.5 w-3.5" />
            Personal Information
          </h3>

          <div className="space-y-4 mb-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Email (disabled) */}
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-input bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          <button
            id="save-personal-btn"
            type="button"
            className="w-full rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>

        {/* ── Location Card ────────────────────────────────────────────── */}
        <div
          id="location-card"
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            <MapPin className="h-3.5 w-3.5" />
            Your Location
          </h3>

          <div className="space-y-4 mb-4">
            {/* City Selector */}
            <div ref={cityDropdownRef} className="relative">
              <label
                htmlFor="profile-city"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                City
              </label>
              <div className="relative">
                <input
                  id="profile-city"
                  type="text"
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setCity("");
                    setCityDropdownOpen(true);
                  }}
                  onFocus={() => setCityDropdownOpen(true)}
                  placeholder="Search for your city…"
                  autoComplete="off"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Dropdown */}
              {cityDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-[200px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
                  {filteredCities.length === 0 ? (
                    <div className="px-3.5 py-3 text-sm text-muted-foreground">
                      No cities found
                    </div>
                  ) : (
                    filteredCities.map((c) => (
                      <button
                        key={`${c.name}-${c.state}`}
                        type="button"
                        onClick={() => selectCity(c.name)}
                        className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-muted ${
                          city === c.name
                            ? "bg-muted font-medium text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {c.state}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Area / Locality */}
            <div>
              <label
                htmlFor="profile-area"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Area / Locality
              </label>
              <input
                id="profile-area"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Anand Vihar, Connaught Place"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/50 mb-4">
            Your AQI data is based on this location
          </p>

          <button
            id="update-location-btn"
            type="button"
            className="w-full rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98]"
          >
            Update Location
          </button>
        </div>
      </div>

      {/* ── Health Conditions Card ──────────────────────────────────────────── */}
      <section id="section-health" className="mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            <Heart className="h-3.5 w-3.5" />
            Your Health Conditions
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {HEALTH_CONDITIONS.map(({ id, label }) => {
              const isSelected = conditions.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCondition(id)}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-input bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/50 mb-4">
            This helps us personalize health advice for you
          </p>

          <button
            id="save-conditions-btn"
            type="button"
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98]"
          >
            Save Conditions
          </button>
        </div>
      </section>

      {/* ── Danger Zone Card ───────────────────────────────────────────────── */}
      <section id="section-danger-zone" className="mb-8">
        <div className="rounded-2xl border border-destructive/30 bg-card p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive mb-1">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Irreversible and destructive actions
          </p>

          <button
            id="delete-account-btn"
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-xl border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive transition-all duration-200 hover:bg-destructive/5 hover:border-destructive/60 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </span>
          </button>
        </div>
      </section>

      {/* ── Delete Confirmation Dialog ──────────────────────────────────────── */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          />

          {/* Dialog */}
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Delete Account
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you sure? This will permanently delete your account and all
              your data. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Account deleted (mock)");
                  setDeleteDialogOpen(false);
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-all duration-200 hover:bg-destructive/90 active:scale-[0.98]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Profile data is stored securely · Changes are local mock data for
        demonstration
      </div>
    </DashboardLayout>
  );
}
