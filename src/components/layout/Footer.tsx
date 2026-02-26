/**
 * Footer Component
 *
 * Landing page footer with:
 * - breatheAI wordmark on the left
 * - "Built for India. Powered by real-time data." tagline
 * - Navigation links: Features, Login, Sign Up
 * - Copyright notice at the bottom
 */

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="landing-footer"
      className="border-t border-border/60 bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Top row ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left side: Brand + tagline */}
          <div className="space-y-1.5">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-outfit)]">
                breathe
                <span className="text-[#38BDF8]">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Built for India. Powered by real-time data.
            </p>
          </div>

          {/* Right side: Links */}
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────────────────────── */}
        <div className="mt-8 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground/60 text-center sm:text-left">
            © 2025 breatheAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
