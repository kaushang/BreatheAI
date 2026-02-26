/**
 * Forecast Page
 *
 * Displays AQI forecast predictions for the next 48 hours.
 * Uses data from the ML microservice to show hourly AQI predictions,
 * pollutant-level forecasts, and trend visualizations using Recharts.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ForecastPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          AQI Forecast
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          48-hour AQI predictions — coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
