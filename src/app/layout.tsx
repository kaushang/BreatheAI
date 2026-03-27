/**
 * Root Layout
 *
 * The root layout for the BreatheAI application. Sets up:
 * - Google Fonts (Inter for body, Outfit for headings)
 * - ThemeProvider for dark/light mode support
 * - Global metadata (SEO) + Open Graph tags
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
  title: "breatheAI — Know Your Air",
  description:
    "Hyperlocal AQI predictions and personalized health advice for India. Real-time NAQI monitoring, 48-hour forecasts, and AI-powered health advisories for 50+ Indian cities.",
  keywords: [
    "AQI India",
    "NAQI",
    "Air Quality Index",
    "Air Pollution India",
    "CPCB",
    "PM2.5",
    "Health Advisory",
    "breatheAI",
    "AQI Prediction",
  ],
  openGraph: {
    title: "breatheAI — Know Your Air",
    description:
      "Hyperlocal AQI predictions and personalized health advice for India",
    type: "website",
    locale: "en_IN",
    siteName: "breatheAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "breatheAI — Know Your Air",
    description:
      "Hyperlocal AQI predictions and personalized health advice for India",
  },
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
