/**
 * Dashboard Layout Wrapper
 *
 * Wraps all authenticated pages with a consistent layout:
 * - Sidebar on the left (desktop) / bottom bar (mobile)
 * - Main content area on the right with proper padding
 *
 * Applied to: /dashboard, /forecast, /ask, /compare, /trends, /alerts, /profile
 */

"use client";

import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop, bottom padding on mobile */}
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
