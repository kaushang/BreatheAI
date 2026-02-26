/**
 * CTA Banner Section — Landing Page
 *
 * A simple full-width banner with:
 * - Headline: "Your city's air quality is changing. Are you prepared?"
 * - CTA button: "Check Your AQI Now"
 * - Light sky blue tint background, flat (no gradient)
 */

import Link from "next/link";

export default function CTABannerSection() {
  return (
    <section id="about" className="bg-[#38BDF8]/[0.04] py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)] leading-snug">
          Your city&apos;s air quality is changing.{" "}
          <br className="hidden sm:inline" />
          Are you prepared?
        </h2>

        <div className="mt-8">
          <Link
            href="/auth/signup"
            className="inline-flex items-center rounded-xl bg-[#38BDF8] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#38BDF8]/20 hover:bg-[#38BDF8]/90 hover:shadow-xl hover:shadow-[#38BDF8]/25 transition-all duration-200"
          >
            Check Your AQI Now
          </Link>
        </div>
      </div>
    </section>
  );
}
