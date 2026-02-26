/**
 * Trends Page
 *
 * Historical AQI trend analysis view. Shows daily, weekly, and monthly AQI trends
 * for a selected city/area. Includes pollutant-level historical data, seasonal
 * patterns, and year-over-year comparisons rendered with Recharts.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TrendsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          AQI Trends
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Historical air quality trend analysis — coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
