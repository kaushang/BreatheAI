"use client";

/**
 * Signup Page — 4-Step Onboarding
 *
 * Step 1: Account (Full name, age, email, password OR Google Sign-In)
 * Step 2: Verification (Firebase Email Link)
 * Step 3: Location (City, area, auto-detect)
 * Step 4: Health (Conditions checklist + AQI threshold)
 *
 * OAuth Logic:
 * If Google is used, Step 2 (Verification) is skipped, but Location and Health are mandatory.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  INDIAN_CITIES,
  findCityByName,
  findNearestCity,
} from "@/constants/cities";

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ["Account", "Verify", "Location", "Health"] as const;
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
  confirmPassword: string;
  age: string;
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOAuth, setIsOAuth] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    city: "",
    area: "",
    healthConditions: [],
    aqiThreshold: SLIDER_DEFAULT,
  });

  // If a user arrives already signed in with Google (e.g., redirected from login),
  // switch this page into OAuth-completion mode and prefill available fields.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const isGoogleUser = user.providerData.some(
        (provider) => provider.providerId === "google.com",
      );
      if (!isGoogleUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) return;

        setIsOAuth(true);
        setStep(1);
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user.displayName || "",
          email: prev.email || user.email || "",
        }));
      } catch (err) {
        console.error("[Signup] OAuth prefill error:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // ─── Google Sign-In ─────────────────────────────────────────────────────

  async function handleGoogleSignIn() {
    setError("");
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const idToken = await user.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Populate formData and stay on Step 1 for Age
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || "",
        email: user.email || "",
      }));

      setIsOAuth(true);
      setError(
        "Success! Now please provide your age to complete your profile.",
      );
    } catch (err: any) {
      console.error("[Google Auth Error]", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  // ─── Email Verification Logic ───────────────────────────────────────────

  async function checkVerification() {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found.");

      await user.reload();
      if (user.emailVerified) {
        setStep(3);
      } else {
        setError("Email not verified yet. Please check your inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check verification status.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setLoading(true);
    setError("");
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setError("Verification email resent!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend email.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Step navigation ────────────────────────────────────────────────────

  async function goNext() {
    setError("");

    if (step === 1) {
      if (!formData.fullName.trim()) return setError("Full name is required.");

      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120)
        return setError("Please enter a valid age.");

      if (isOAuth) {
        // Skip verification (Step 2) for Google users
        setStep(3);
        return;
      }

      // Validations for Email/Password flow
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim()))
        return setError("Please enter a valid email address.");

      if (formData.password.length < 6)
        return setError("Password must be at least 6 characters.");

      if (formData.password !== formData.confirmPassword)
        return setError("Passwords do not match.");

      // Create account and send verification
      setLoading(true);
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        await updateProfile(credential.user, {
          displayName: formData.fullName,
        });
        await sendEmailVerification(credential.user);
        setStep(2);
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          setError("This email is already registered.");
        } else {
          setError(err.message || "Sign up failed.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 2) {
      await checkVerification();
      return;
    }

    if (step === 3) {
      if (!formData.city) return setError("Please select a city.");
      setStep(4);
      return;
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
        next = prev.healthConditions.includes("none") ? [] : ["none"];
      } else {
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
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication failed.");

      const cityData = findCityByName(formData.city);
      const lat = cityData?.latitude ?? 0;
      const lng = cityData?.longitude ?? 0;

      const conditions = formData.healthConditions.filter((c) => c !== "none");

      const profilePayload = {
        uid: user.uid,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        age: parseInt(formData.age) || 0,
        city: formData.city,
        area: formData.area.trim() || formData.city,
        lat,
        lng,
        health_conditions: conditions,
        aqi_alert_threshold: formData.aqiThreshold,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), profilePayload);

      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Session creation failed.");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("[Signup Submit Error]", err);
      setError(err.message || "Failed to complete setup.");
      setLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-outfit)]">
          {isOAuth && step === 1
            ? "Complete your profile"
            : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isOAuth && step === 1
            ? "Tell us a bit more about yourself"
            : `Follow ${TOTAL_STEPS} simple steps to set up your profile`}
        </p>
      </div>

      {/* Step Progress Indicator */}
      <StepIndicator currentStep={step} />

      {/* Error / Success Message */}
      {error && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            error.includes("resent") ||
            error.includes("inbox") ||
            error.includes("Success")
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
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
            onGoogleSignIn={handleGoogleSignIn}
            isGoogleLoading={isGoogleLoading}
            isOAuth={isOAuth}
          />
        )}
        {step === 2 && (
          <StepVerify
            email={formData.email}
            onResend={resendVerification}
            loading={loading}
          />
        )}
        {step === 3 && (
          <StepLocation formData={formData} setFormData={setFormData} />
        )}
        {step === 4 && (
          <StepHealth
            formData={formData}
            toggleCondition={toggleCondition}
            setFormData={setFormData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6">
        {step > 1 && step !== 2 && (
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
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : step === 2
                ? "I have verified"
                : "Continue"}
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
                <LoadingSpinner />
                Finalizing…
              </span>
            ) : (
              "Complete Setup"
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
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
                  className={`text-xs font-medium ${isCurrent ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </div>
              {stepNum < TOTAL_STEPS && (
                <div className="flex-1 mx-2 mt-[-18px]">
                  <div
                    className={`h-[1.5px] w-full transition-colors ${currentStep > stepNum ? "bg-primary" : "bg-border"}`}
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

function StepAccount({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  onGoogleSignIn,
  isGoogleLoading,
  isOAuth,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onGoogleSignIn: () => void;
  isGoogleLoading: boolean;
  isOAuth: boolean;
}) {
  return (
    <div className="space-y-4">
      {!isOAuth ? (
        <>
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <LoadingSpinner />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-border" />
            <span className="px-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              or sign up with email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary">
              Authenticated with Google
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formData.email}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
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
            placeholder="Your name"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label
            htmlFor="signup-age"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Age
          </label>
          <input
            id="signup-age"
            type="number"
            value={formData.age}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, age: e.target.value }))
            }
            placeholder="Years"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {!isOAuth && (
        <>
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
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Min 6 chars"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="signup-confirm"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Confirm
              </label>
              <input
                id="signup-confirm"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Repeat pass"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? "Hide" : "Show"} passwords
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StepVerify({
  email,
  onResend,
  loading,
}: {
  email: string;
  onResend: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6 text-center py-4">
      <div>
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H17.5C20 5 22 7 22 9.5V17Z" />
            <path d="m22 10-8.53 4.47a2 2 0 0 1-1.94 0L3 10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Verify your email
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
          We&apos;ve sent a verification link to{" "}
          <span className="font-semibold text-foreground">{email}</span>. Click
          the link in your email to continue.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
        Note: You may need to check your spam folder.
      </div>

      <p className="text-sm text-muted-foreground">
        Didn&apos;t receive it?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="text-primary font-medium hover:underline disabled:opacity-50"
        >
          Resend email
        </button>
      </p>
    </div>
  );
}

function StepLocation({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const [cityQuery, setCityQuery] = useState(formData.city);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return INDIAN_CITIES;
    const q = cityQuery.toLowerCase();
    return INDIAN_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.state.toLowerCase().includes(q),
    );
  }, [cityQuery]);

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

  function handleAutoDetect() {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCity(latitude, longitude);
        selectCity(nearest.name);
        setDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to detect location. Please select manually.");
        setDetecting(false);
      },
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={detecting}
        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
      >
        {detecting ? (
          <LoadingSpinner />
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
        )}
        {detecting ? "Detecting location..." : "Auto-detect location"}
      </button>

      <div className="relative flex items-center">
        <div className="flex-1 h-px bg-border" />
        <span className="px-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          or search manually
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div ref={dropdownRef} className="relative">
        <label
          htmlFor="signup-city"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          City
        </label>
        <div className="relative">
          <input
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
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

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
                  className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-muted ${formData.city === city.name ? "bg-muted font-medium" : ""}`}
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

      <div>
        <label
          htmlFor="signup-area"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Area / Locality{" "}
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
          placeholder="e.g. Andheri West"
          className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}

function StepHealth({
  formData,
  toggleCondition,
  setFormData,
}: {
  formData: FormData;
  toggleCondition: (id: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
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
                className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${isSelected ? "border-primary bg-primary/5 font-medium" : "border-input hover:bg-muted"}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}
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
                  </div>
                  {label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
            style={{ "--slider-percent": `${sliderPercent}%` } as any}
          />
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground px-0.5">
            <span>
              {formData.aqiThreshold} (
              {getThresholdLabel(formData.aqiThreshold)})
            </span>
            <div className="flex gap-4">
              <span>50 (Good)</span>
              <span>300 (Poor)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
