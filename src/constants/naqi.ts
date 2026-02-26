/**
 * Indian National Air Quality Index (NAQI) Breakpoints & Categories
 *
 * This file contains the official NAQI breakpoints as defined by the
 * Central Pollution Control Board (CPCB), India. The Indian NAQI scale
 * differs from the US AQI scale in pollutants covered, breakpoint ranges,
 * and category definitions.
 *
 * Key differences from US AQI:
 * - Includes NH3 (Ammonia) as a tracked pollutant
 * - Uses 6 categories (Good → Severe) instead of the US 6-tier system
 * - Different numeric breakpoints for each pollutant
 * - Different health advisory messages tailored to Indian conditions
 *
 * References:
 * - CPCB National Air Quality Index: https://cpcb.nic.in/
 * - IIT Kanpur NAQI methodology document
 */

import { NAQICategory, NAQIPollutantBreakpoint } from "@/types";

// ─── AQI Category Definitions ────────────────────────────────────────────────

/**
 * The 6 official NAQI categories with their AQI ranges, color codes
 * (matching CPCB standards), and health impact messages.
 */
export const NAQI_CATEGORIES: NAQICategory[] = [
  {
    category: "Good",
    range: { min: 0, max: 50 },
    colorHex: "#009966",
    colorName: "Green",
    healthMessage:
      "Air quality is satisfactory and poses little or no health risk. Ideal for outdoor activities.",
    generalGuidance:
      "Enjoy outdoor activities freely. No precautions needed.",
  },
  {
    category: "Satisfactory",
    range: { min: 51, max: 100 },
    colorHex: "#FFDE33",
    colorName: "Yellow",
    healthMessage:
      "Air quality is acceptable. Minor breathing discomfort may be felt by sensitive people on prolonged exposure.",
    generalGuidance:
      "Outdoor activities are generally fine. Sensitive individuals should monitor symptoms.",
  },
  {
    category: "Moderate",
    range: { min: 101, max: 200 },
    colorHex: "#FF9933",
    colorName: "Orange",
    healthMessage:
      "Breathing discomfort may be experienced by people with lung disease, asthma, and heart disease. The general public is less likely to be affected.",
    generalGuidance:
      "People with respiratory or heart conditions should reduce prolonged outdoor exertion. Close windows if indoors.",
  },
  {
    category: "Poor",
    range: { min: 201, max: 300 },
    colorHex: "#CC0033",
    colorName: "Red",
    healthMessage:
      "Breathing discomfort is experienced on prolonged exposure. People with lung and heart disease may experience more serious effects.",
    generalGuidance:
      "Avoid prolonged outdoor exertion. Sensitive groups should stay indoors. Use air purifiers if available.",
  },
  {
    category: "Very Poor",
    range: { min: 301, max: 400 },
    colorHex: "#660099",
    colorName: "Purple",
    healthMessage:
      "Respiratory illness is likely on prolonged exposure. Significant aggravation for people with lung and heart disease. Widespread impact on healthy population.",
    generalGuidance:
      "Avoid all outdoor physical activities. Keep windows and doors closed. Use N95 masks if going outside is unavoidable.",
  },
  {
    category: "Severe",
    range: { min: 401, max: 500 },
    colorHex: "#7E0023",
    colorName: "Maroon",
    healthMessage:
      "Serious health impacts. Even healthy people may experience severe respiratory issues. Affects entire population. May trigger respiratory and cardiovascular emergencies.",
    generalGuidance:
      "Stay indoors with air purification. Avoid all outdoor activities. Seek medical attention if experiencing breathing difficulties. Schools and outdoor work should be suspended.",
  },
];

// ─── Pollutant Breakpoints ───────────────────────────────────────────────────

/**
 * Official CPCB NAQI breakpoints for each pollutant.
 *
 * Each pollutant has 6 breakpoint ranges corresponding to the 6 AQI categories.
 * The sub-index for each pollutant is calculated using linear interpolation
 * within these breakpoint ranges. The overall AQI is the maximum of all
 * individual sub-indices.
 *
 * Concentration units:
 * - PM2.5: µg/m³ (24-hour average)
 * - PM10: µg/m³ (24-hour average)
 * - NO2: µg/m³ (24-hour average)
 * - SO2: µg/m³ (24-hour average)
 * - CO: mg/m³ (8-hour average)
 * - O3: µg/m³ (8-hour average)
 * - NH3: µg/m³ (24-hour average)
 */
export const NAQI_POLLUTANT_BREAKPOINTS: NAQIPollutantBreakpoint[] = [
  {
    pollutant: "PM2.5",
    unit: "µg/m³",
    averagingPeriod: "24-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 30 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 31, concentrationHigh: 60 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 61, concentrationHigh: 90 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 91, concentrationHigh: 120 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 121, concentrationHigh: 250 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 251, concentrationHigh: 500 },
    ],
  },
  {
    pollutant: "PM10",
    unit: "µg/m³",
    averagingPeriod: "24-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 50 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 51, concentrationHigh: 100 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 101, concentrationHigh: 250 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 251, concentrationHigh: 350 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 351, concentrationHigh: 430 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 431, concentrationHigh: 510 },
    ],
  },
  {
    pollutant: "NO2",
    unit: "µg/m³",
    averagingPeriod: "24-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 40 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 41, concentrationHigh: 80 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 81, concentrationHigh: 180 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 181, concentrationHigh: 280 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 281, concentrationHigh: 400 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 401, concentrationHigh: 520 },
    ],
  },
  {
    pollutant: "SO2",
    unit: "µg/m³",
    averagingPeriod: "24-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 40 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 41, concentrationHigh: 80 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 81, concentrationHigh: 380 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 381, concentrationHigh: 800 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 801, concentrationHigh: 1600 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 1601, concentrationHigh: 2100 },
    ],
  },
  {
    pollutant: "CO",
    unit: "mg/m³",
    averagingPeriod: "8-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 1.0 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 1.1, concentrationHigh: 2.0 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 2.1, concentrationHigh: 10.0 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 10.1, concentrationHigh: 17.0 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 17.1, concentrationHigh: 34.0 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 34.1, concentrationHigh: 46.0 },
    ],
  },
  {
    pollutant: "O3",
    unit: "µg/m³",
    averagingPeriod: "8-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 50 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 51, concentrationHigh: 100 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 101, concentrationHigh: 168 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 169, concentrationHigh: 208 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 209, concentrationHigh: 748 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 749, concentrationHigh: 960 },
    ],
  },
  {
    pollutant: "NH3",
    unit: "µg/m³",
    averagingPeriod: "24-hour",
    breakpoints: [
      { aqiLow: 0, aqiHigh: 50, concentrationLow: 0, concentrationHigh: 200 },
      { aqiLow: 51, aqiHigh: 100, concentrationLow: 201, concentrationHigh: 400 },
      { aqiLow: 101, aqiHigh: 200, concentrationLow: 401, concentrationHigh: 800 },
      { aqiLow: 201, aqiHigh: 300, concentrationLow: 801, concentrationHigh: 1200 },
      { aqiLow: 301, aqiHigh: 400, concentrationLow: 1201, concentrationHigh: 1800 },
      { aqiLow: 401, aqiHigh: 500, concentrationLow: 1801, concentrationHigh: 2400 },
    ],
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Get the NAQI category for a given AQI value.
 * Returns the matching category object or undefined if the value is out of range.
 */
export function getNAQICategory(aqiValue: number): NAQICategory | undefined {
  return NAQI_CATEGORIES.find(
    (cat) => aqiValue >= cat.range.min && aqiValue <= cat.range.max
  );
}

/**
 * Get the color hex code for a given AQI value.
 * Defaults to gray if the value is out of range.
 */
export function getNAQIColor(aqiValue: number): string {
  const category = getNAQICategory(aqiValue);
  return category?.colorHex ?? "#808080";
}

/**
 * Calculate the sub-index for a specific pollutant given its concentration.
 * Uses the CPCB linear interpolation formula:
 *   I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low
 *
 * Where:
 *   I = AQI sub-index
 *   C = Observed concentration of the pollutant
 *   C_low / C_high = Breakpoint concentrations bracketing C
 *   I_low / I_high = AQI values corresponding to C_low and C_high
 */
export function calculateSubIndex(
  pollutantName: string,
  concentration: number
): number | null {
  const pollutant = NAQI_POLLUTANT_BREAKPOINTS.find(
    (p) => p.pollutant.toLowerCase() === pollutantName.toLowerCase()
  );

  if (!pollutant) return null;

  for (const bp of pollutant.breakpoints) {
    if (
      concentration >= bp.concentrationLow &&
      concentration <= bp.concentrationHigh
    ) {
      const subIndex =
        ((bp.aqiHigh - bp.aqiLow) /
          (bp.concentrationHigh - bp.concentrationLow)) *
          (concentration - bp.concentrationLow) +
        bp.aqiLow;
      return Math.round(subIndex);
    }
  }

  // Concentration exceeds the highest breakpoint
  return concentration > 0 ? 500 : 0;
}

/**
 * List of all tracked pollutant names in the Indian NAQI system.
 */
export const NAQI_POLLUTANTS = [
  "PM2.5",
  "PM10",
  "NO2",
  "SO2",
  "CO",
  "O3",
  "NH3",
] as const;

export type NAQIPollutantName = (typeof NAQI_POLLUTANTS)[number];
