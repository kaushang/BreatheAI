/**
 * Homepage — Landing Page
 *
 * The public-facing landing page for BreatheAI. Assembles:
 *   1. Navbar — sticky top navigation
 *   2. Hero Section — value prop, CTA, mock AQI card preview
 *   3. Features Section — 6 feature cards in a 3×2 grid
 *   4. How It Works — 3-step horizontal walkthrough
 *   5. CTA Banner — urgency-driven call-to-action
 *   6. Footer — branding, links, copyright
 */

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTABannerSection,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTABannerSection />
      </main>

      <Footer />
    </div>
  );
}
