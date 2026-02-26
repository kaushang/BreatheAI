/**
 * Homepage
 *
 * Landing page for BreatheAI. Displays the app branding, tagline,
 * and a brief overview of features. Will eventually include:
 * - Hero section with live AQI map preview
 * - Quick city search
 * - Featured cities AQI cards
 * - Call-to-action for signup/login
 */

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6 px-4">
        {/* App branding */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            BreatheAI
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Breathe Smarter.
        </p>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-muted-foreground/70 max-w-md mx-auto">
          Real-time Indian AQI monitoring, 48-hour forecasts, and personalized
          health advisories — powered by AI.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Foundation ready — features coming soon
        </div>
      </div>
    </main>
  );
}
