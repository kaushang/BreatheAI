/**
 * Auth Layout
 *
 * Shared layout for /auth/login and /auth/signup pages.
 * Provides a centered, single-column layout with consistent branding.
 * Calm, minimal design — no distracting elements.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BreatheAI — Sign In",
  description:
    "Sign in or create an account to access personalized AQI monitoring and health advisories.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M9 17C9 17 10.5 12 14 12C17.5 12 19 17 19 17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="14" cy="9" r="1.5" fill="currentColor" />
          </svg>
          <span className="text-lg font-semibold tracking-tight font-[family-name:var(--font-outfit)]">
            BreatheAI
          </span>
        </Link>
      </header>

      {/* Main content — centered */}
      <main className="flex-1 flex items-start justify-center px-6 pt-8 pb-16 sm:pt-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-5 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BreatheAI · Breathe Smarter
        </p>
      </footer>
    </div>
  );
}
