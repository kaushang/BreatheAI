/**
 * Sidebar Navigation
 *
 * Fixed left sidebar for the authenticated dashboard area.
 * Desktop: full-height sidebar with wordmark, nav links, and user info.
 * Mobile: collapses into a fixed bottom navigation bar.
 *
 * Active link is highlighted with sky blue (#38BDF8).
 * Uses lucide-react icons for each navigation item.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();

  const [userName, setUserName] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch user name once on mount
  useEffect(() => {
    async function fetchName() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data?.full_name) {
        setUserName(data.full_name);
      }
    }
    fetchName();
  }, [supabase]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [supabase, router]);

  // Check if a nav item is currently active
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

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
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#38BDF8]/10 text-[#38BDF8]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
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

        {/* User info + logout */}
        <div className="border-t border-border px-4 py-4">
          {userName && (
            <p className="mb-2 truncate text-sm font-medium text-foreground px-1">
              {userName}
            </p>
          )}
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
        className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t border-border bg-card/95 backdrop-blur-md"
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-[#38BDF8]" : "text-muted-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-[#38BDF8]" : "text-muted-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        {/* More menu — shows remaining items */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
            isActive("/profile") || isActive("/alerts")
              ? "text-[#38BDF8]"
              : "text-muted-foreground",
          )}
        >
          <UserCircle
            className={cn(
              "h-5 w-5 transition-colors",
              isActive("/profile") || isActive("/alerts")
                ? "text-[#38BDF8]"
                : "text-muted-foreground",
            )}
          />
          More
        </Link>
      </nav>
    </>
  );
}
