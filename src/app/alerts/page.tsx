/**
 * Alerts Page
 *
 * AQI alert management view. Displays active and past alerts for the user's
 * configured cities. Allows configuring alert thresholds, notification preferences
 * (email via Resend, in-app), and viewing alert history with timestamps.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          AQI Alerts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure and view your air quality alerts — coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
