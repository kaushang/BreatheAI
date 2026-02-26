/**
 * How It Works Section — Landing Page
 *
 * Displays 3 steps in a horizontal layout:
 * 1. Create your profile
 * 2. We analyze your air
 * 3. Get personalized insights
 *
 * Each step has a step number, title, and short description.
 */

const STEPS = [
  {
    step: 1,
    title: "Create your profile",
    description:
      "Set your city, area, and health conditions so we can personalize everything for you.",
  },
  {
    step: 2,
    title: "We analyze your air",
    description:
      "We fetch real-time and historical AQI data for your exact location using CPCB monitoring stations.",
  },
  {
    step: 3,
    title: "Get personalized insights",
    description:
      "Receive forecasts, health advice, and smart alerts tailored specifically to you.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Section heading ─────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Get started in under a minute. It&apos;s that simple.
          </p>
        </div>

        {/* ── Steps ───────────────────────────────────────────────────── */}
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="relative text-center sm:text-left">
              {/* Step number */}
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-sm font-bold mb-4">
                {item.step}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground font-[family-name:var(--font-outfit)]">
                {item.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
