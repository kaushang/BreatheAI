/**
 * Navbar Component
 *
 * Landing page navigation bar. Sticky at the top with:
 * - breatheAI wordmark on the left
 * - Centered nav links: Features, How it Works, About
 * - Login (outlined) and Get Started (filled, sky blue) buttons on the right
 * - Collapses into a hamburger menu on mobile
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      id="landing-navbar"
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
            breathe
            <span className="text-[#38BDF8]">AI</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links (centered) ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Desktop Auth Buttons ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-[#38BDF8] px-4 py-2 text-sm font-medium text-white hover:bg-[#38BDF8]/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* ── Mobile Hamburger ─────────────────────────────────────────── */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* ── Mobile Menu Panel ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-menu-panel"
          className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="border-t border-border/60 pt-3 mt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground text-center hover:bg-muted transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-[#38BDF8] px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-[#38BDF8]/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
