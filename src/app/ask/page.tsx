/**
 * Ask AI Page
 *
 * Conversational AI assistant for air quality questions.
 * Users can ask health-related queries about AQI, pollution, and outdoor safety.
 */

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AskAIPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-foreground font-heading">
          Ask AI
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask questions about air quality and health — coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
