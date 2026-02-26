/**
 * Profile Page
 *
 * User profile management view. Allows users to update their personal information,
 * set their primary city/area, configure health conditions (asthma, COPD, etc.),
 * and set AQI alert thresholds for personalized notifications.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          Profile Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile and health preferences — coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
