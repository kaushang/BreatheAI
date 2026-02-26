"use client";

/**
 * Signup Page — 3-Step Onboarding
 *
 * Step 1: Full name, email, password
 * Step 2: City (searchable dropdown) + area/locality
 * Step 3: Health conditions checklist + AQI alert threshold slider
 *
 * On submit:
 * 1. Creates Supabase auth user (signUp)
 * 2. Inserts row into profiles table
 * 3. Redirects to /dashboard
 *
 * UI: Calm, minimal, Inter font, step progress indicator at top.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { INDIAN_CITIES, findCityByName } from "@/constants/cities";

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ["Account", "Location", "Health"] as const;
const TOTAL_STEPS = STEPS.length;

const HEALTH_CONDITIONS = [
  { id: "none", label: "None" },
  { id: "asthma", label: "Asthma" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "elderly", label: "Elderly" },
  { id: "pregnant", label: "Pregnant" },
  { id: "child_under_12", label: "Child under 12" },
] as const;

const SLIDER_MIN = 50;
const SLIDER_MAX = 300;
const SLIDER_DEFAULT = 150;

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  password: string;
  city: string;
  area: string;
  healthConditions: string[];
  aqiThreshold: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    city: "",
    area: "",
    healthConditions: [],
    aqiThreshold: SLIDER_DEFAULT,
  });

  // ─── Step navigation ────────────────────────────────────────────────────

  function goNext() {
    setError("");
    if (step === 1) {
      if (!formData.fullName.trim()) return setError("Full name is required.");
      if (!formData.email.trim()) return setError("Email is required.");
      if (formData.password.length < 6)
        return setError("Password must be at least 6 characters.");
    }
    if (step === 2) {
      if (!formData.city) return setError("Please select a city.");
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  // ─── Health conditions toggle ───────────────────────────────────────────

  function toggleCondition(id: string) {
    setFormData((prev) => {
      let next: string[];
      if (id === "none") {
        // Selecting "None" clears all others
        next = prev.healthConditions.includes("none") ? [] : ["none"];
      } else {
        // Remove "none" if selecting a real condition
        const withoutNone = prev.healthConditions.filter((c) => c !== "none");
        if (withoutNone.includes(id)) {
          next = withoutNone.filter((c) => c !== id);
        } else {
          next = [...withoutNone, id];
        }
      }
      return { ...prev, healthConditions: next };
    });
  }

  // ─── Submit ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Account creation failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Get city coordinates
      const cityData = findCityByName(formData.city);
      const lat = cityData?.latitude ?? 0;
      const lng = cityData?.longitude ?? 0;

      // 3. Determine health conditions to save
      const conditions = formData.healthConditions.filter((c) => c !== "none");

      // 4. Insert profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        city: formData.city,
        area: formData.area.trim(),
        lat,
        lng,
        health_conditions: conditions,
        aqi_alert_threshold: formData.aqiThreshold,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-outfit)]">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set up your profile in 3 quick steps
        </p>
      </div>

      {/* Step Progress Indicator */}
      <StepIndicator currentStep={step} />

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[280px]">
        {step === 1 && (
          <StepAccount
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        )}
        {step === 2 && (
          <StepLocation formData={formData} setFormData={setFormData} />
        )}
        {step === 3 && (
          <StepHealth
            formData={formData}
            toggleCondition={toggleCondition}
            setFormData={setFormData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back
          </button>
        )}
        <div className="flex-1" />
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>
        )}
      </div>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Step Indicator Component ─────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      {/* Steps row */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div
              key={label}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                    ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-2 border-primary text-primary bg-background"
                          : "border border-border text-muted-foreground bg-background"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {stepNum < TOTAL_STEPS && (
                <div className="flex-1 mx-2 mt-[-18px]">
                  <div
                    className={`h-[1.5px] w-full transition-colors ${
                      currentStep > stepNum ? "bg-primary" : "bg-border"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Account ──────────────────────────────────────────────────────────

function StepAccount({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="space-y-4">
      {/* Full Name */}
      <div>
        <label
          htmlFor="signup-fullname"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Full name
        </label>
        <input
          id="signup-fullname"
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
          }
          placeholder="Your full name"
          autoComplete="name"
          className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="signup-email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Must be at least 6 characters
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Location ─────────────────────────────────────────────────────────

function StepLocation({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const [cityQuery, setCityQuery] = useState(formData.city);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return INDIAN_CITIES;
    const q = cityQuery.toLowerCase();
    return INDIAN_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.state.toLowerCase().includes(q),
    );
  }, [cityQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCity(cityName: string) {
    setCityQuery(cityName);
    setFormData((prev) => ({ ...prev, city: cityName }));
    setIsDropdownOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* City */}
      <div ref={dropdownRef} className="relative">
        <label
          htmlFor="signup-city"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          City
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="signup-city"
            type="text"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setFormData((prev) => ({ ...prev, city: "" }));
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search for your city…"
            autoComplete="off"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-[200px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
            {filteredCities.length === 0 ? (
              <div className="px-3.5 py-3 text-sm text-muted-foreground">
                No cities found
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={`${city.name}-${city.state}`}
                  type="button"
                  onClick={() => selectCity(city.name)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-muted ${
                    formData.city === city.name
                      ? "bg-muted font-medium text-foreground"
                      : "text-foreground"
                  }`}
                >
                  <span>{city.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {city.state}
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
          htmlFor="signup-area"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Area / Locality
          <span className="text-muted-foreground font-normal ml-1">
            (optional)
          </span>
        </label>
        <input
          id="signup-area"
          type="text"
          value={formData.area}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, area: e.target.value }))
          }
          placeholder="e.g. Andheri West, Connaught Place"
          autoComplete="address-level2"
          className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Selected city confirmation */}
      {formData.city && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3.5 py-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary shrink-0"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm text-foreground">
            <span className="font-medium">{formData.city}</span>
            {formData.area && (
              <span className="text-muted-foreground"> · {formData.area}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Health ───────────────────────────────────────────────────────────

function StepHealth({
  formData,
  toggleCondition,
  setFormData,
}: {
  formData: FormData;
  toggleCondition: (id: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  // Compute slider percentage for the track fill
  const sliderPercent =
    ((formData.aqiThreshold - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  function getThresholdLabel(value: number): string {
    if (value <= 50) return "Good";
    if (value <= 100) return "Satisfactory";
    if (value <= 200) return "Moderate";
    if (value <= 300) return "Poor";
    return "Very Poor";
  }

  return (
    <div className="space-y-6">
      {/* Health Conditions */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Health conditions
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Select any that apply — this personalizes your advisories.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {HEALTH_CONDITIONS.map(({ id, label }) => {
            const isSelected = formData.healthConditions.includes(id);
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
      </div>

      {/* AQI Alert Threshold Slider */}
      <div>
        <label
          htmlFor="signup-threshold"
          className="block text-sm font-medium text-foreground mb-1"
        >
          AQI alert threshold
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          You&apos;ll be notified when AQI exceeds this value.
        </p>

        <div className="space-y-3">
          {/* Slider */}
          <div className="relative">
            <input
              id="signup-threshold"
              type="range"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={10}
              value={formData.aqiThreshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  aqiThreshold: Number(e.target.value),
                }))
              }
              className="slider-input w-full"
              style={
                {
                  "--slider-percent": `${sliderPercent}%`,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Value display */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{SLIDER_MIN}</span>
            <span className="text-sm font-medium text-foreground">
              {formData.aqiThreshold}{" "}
              <span className="text-muted-foreground font-normal">
                — {getThresholdLabel(formData.aqiThreshold)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">{SLIDER_MAX}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
