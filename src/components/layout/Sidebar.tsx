/**
 * Sidebar Navigation
 *
 * Fixed left sidebar for the authenticated dashboard area.
 * Desktop: full-height sidebar with wordmark, nav links, theme toggle, and user info.
 * Mobile: collapses into a fixed bottom navigation bar with icons only.
 *
 * Active link is highlighted with sky blue (#38BDF8).
 * Uses lucide-react icons for each navigation item.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CloudSun,
  BotMessageSquare,
  GitCompareArrows,
  TrendingUp,
  Bell,
  UserCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

// ─── Navigation items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Forecast", href: "/forecast", icon: CloudSun },
  { label: "Ask AI", href: "/ask", icon: BotMessageSquare },
  { label: "Compare Cities", href: "/compare", icon: GitCompareArrows },
  { label: "Trends", href: "/trends", icon: TrendingUp },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [userName, setUserName] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for theme icon
  useEffect(() => setMounted(true), []);

  // Fetch user display name from Firestore on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserName(data.full_name || user.displayName || "");
        }
      } catch (err) {
        console.error("[Sidebar] Error fetching user name:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch (err) {
      console.error("[Sidebar] Logout error:", err);
    } finally {
      router.push("/auth/login");
    }
  }, [router]);

  // Check if a nav item is currently active
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* ─── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside
        id="sidebar-desktop"
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 w-[260px] flex-col border-r border-border bg-card"
      >
        {/* Wordmark */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 select-none"
          >
            <span className="text-xl font-bold tracking-tight text-foreground font-heading">
              breathe
              <span style={{ color: "#38BDF8" }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#38BDF8]/10 text-[#38BDF8]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
                    active
                      ? "text-[#38BDF8]"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: theme toggle + user info + logout */}
        <div className="border-t border-border px-4 py-4 space-y-2">
          {/* Dark/Light mode toggle */}
          <button
            id="theme-toggle"
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {mounted && (
              <div className="relative h-[18px] w-[18px] shrink-0">
                <Sun
                  className={cn(
                    "absolute inset-0 h-[18px] w-[18px] transition-all duration-300",
                    isDark
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0",
                  )}
                />
                <Moon
                  className={cn(
                    "absolute inset-0 h-[18px] w-[18px] transition-all duration-300",
                    isDark
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100",
                  )}
                />
              </div>
            )}
            {mounted ? (isDark ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
          </button>

          {/* User name */}
          {userName && (
            <p className="truncate text-sm font-medium text-foreground px-3">
              {userName}
            </p>
          )}

          {/* Logout */}
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              loggingOut && "opacity-50 pointer-events-none",
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Bottom Navigation ──────────────────────────────────── */}
      <nav
        id="sidebar-mobile"
        className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t border-border bg-card/95 backdrop-blur-md safe-bottom"
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-150",
                active ? "text-[#38BDF8]" : "text-muted-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-150",
                  active ? "text-[#38BDF8]" : "text-muted-foreground",
                )}
              />
              <span className="hidden xs:block">{item.label}</span>
            </Link>
          );
        })}

        {/* More menu — shows remaining items */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-150",
            isActive("/profile") || isActive("/alerts")
              ? "text-[#38BDF8]"
              : "text-muted-foreground",
          )}
        >
          <UserCircle
            className={cn(
              "h-5 w-5 transition-colors duration-150",
              isActive("/profile") || isActive("/alerts")
                ? "text-[#38BDF8]"
                : "text-muted-foreground",
            )}
          />
          <span className="hidden xs:block">More</span>
        </Link>
      </nav>
    </>
  );
}
