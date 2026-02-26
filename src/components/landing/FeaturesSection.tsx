/**
 * Features Section — Landing Page
 *
 * Displays 6 feature cards in a 3×2 grid:
 * - 48-Hour AQI Forecast
 * - Personalized Health Advice
 * - Ask in Plain English
 * - Hyperlocal Accuracy
 * - Smart Alerts
 * - Historical Trends
 *
 * Cards are flat, minimal, with a light border. Icon on top, title, description.
 */

const FEATURES = [
  {
    icon: "🕐",
    title: "48-Hour AQI Forecast",
    description:
      "Know what the air will be like tomorrow before you step outside.",
  },
  {
    icon: "🏥",
    title: "Personalized Health Advice",
    description:
      "Advice tailored to your health conditions, not generic warnings.",
  },
  {
    icon: "💬",
    title: "Ask in Plain English",
    description: "Ask 'Is it safe to run tomorrow?' and get a straight answer.",
  },
  {
    icon: "📍",
    title: "Hyperlocal Accuracy",
    description: "AQI for your area, not just your city.",
  },
  {
    icon: "🔔",
    title: "Smart Alerts",
    description:
      "Get notified when air quality crosses your personal threshold.",
  },
  {
    icon: "📊",
    title: "Historical Trends",
    description: "See how your city's air quality has changed over time.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Section heading ─────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
            Everything you need to breathe smarter
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From real-time monitoring to intelligent predictions, we&apos;ve got
            your air covered.
          </p>
        </div>

        {/* ── Feature grid (3×2) ──────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 sm:p-7 transition-all duration-200 hover:border-[#38BDF8]/30 hover:shadow-sm"
            >
              {/* Icon */}
              <div className="text-3xl mb-4">{feature.icon}</div>

              {/* Title */}
              <h3 className="text-base font-semibold text-foreground font-[family-name:var(--font-outfit)]">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
