/**
 * Root Layout
 *
 * The root layout for the BreatheAI application. Sets up:
 * - Google Fonts (Inter for body, Outfit for headings)
 * - ThemeProvider for dark/light mode support
 * - Global metadata (SEO)
 * - Base HTML structure with dark mode class strategy
 */

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "BreatheAI — Breathe Smarter | Indian AQI Predictions & Health Advisory",
  description:
    "BreatheAI provides real-time Indian AQI (NAQI) monitoring, 48-hour air quality forecasts, and personalized health advisories for 50+ Indian cities. Stay informed, breathe smarter.",
  keywords: [
    "AQI India",
    "NAQI",
    "Air Quality Index",
    "Air Pollution India",
    "CPCB",
    "PM2.5",
    "Health Advisory",
    "BreatheAI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
