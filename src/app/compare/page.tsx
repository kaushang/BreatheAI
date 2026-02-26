/**
 * Compare Page
 *
 * Allows users to compare AQI readings across multiple Indian cities side-by-side.
 * Features multi-city selection, comparative bar/line charts, and pollutant breakdowns.
 * Useful for understanding regional air quality differences.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ComparePage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          Compare Cities
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Side-by-side AQI comparison across Indian cities — coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
