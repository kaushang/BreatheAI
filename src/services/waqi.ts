/**
 * WAQI Service
 *
 * Service layer that fetches live AQI data from the World Air Quality Index
 * (WAQI) API and transforms it into the application's AQIReading type.
 *
 * Uses the pre-configured axios WAQI client from lib/api/waqi.ts.
 * Covers geo-coordinate based station lookup, pollutant extraction,
 * and graceful error handling for network/API failures.
 *
 * WAQI API Docs: https://aqicn.org/json-api/doc/
 */

import { waqiClient } from "@/lib/api/waqi";
import type { AQIReading, PollutantReading } from "@/types";

// ─── WAQI Response Shapes ────────────────────────────────────────────────────

/** Raw WAQI API response structure for the /feed/geo: endpoint. */
interface WAQIFeedResponse {
  status: string;
  data: {
    aqi: number;
    idx: number;
    /** Attribution / station info */
    city: {
      name: string;
      geo: [number, number];
      url: string;
    };
    /** Dominant pollutant key (e.g. "pm25") */
    dominentpol?: string; // WAQI uses this typo in their API
    /** Individual pollutant readings – each key maps to { v: number } */
    iaqi: Record<string, { v: number }>;
    time: {
      /** ISO-formatted timestamp string */
      iso: string;
      s: string;
      tz: string;
    };
  };
}

// ─── Pollutant metadata mapping ──────────────────────────────────────────────

/** Maps WAQI pollutant keys to human-readable names and units. */
const POLLUTANT_META: Record<string, { name: string; unit: string }> = {
  pm25: { name: "PM2.5", unit: "µg/m³" },
  pm10: { name: "PM10", unit: "µg/m³" },
  no2: { name: "NO₂", unit: "µg/m³" },
  so2: { name: "SO₂", unit: "µg/m³" },
  co: { name: "CO", unit: "mg/m³" },
  o3: { name: "O₃", unit: "µg/m³" },
};

/** The pollutant keys we are interested in extracting from the WAQI response. */
const TRACKED_POLLUTANTS = ["pm25", "pm10", "no2", "so2", "co", "o3"] as const;

// ─── Service Function ────────────────────────────────────────────────────────

/**
 * Fetches the current live AQI reading for a geographic coordinate pair.
 *
 * Calls the WAQI geo-feed endpoint, extracts pollutant sub-index values,
 * and returns a clean, typed `AQIReading` object.
 *
 * @param lat  Latitude of the location (e.g. 28.61 for Delhi)
 * @param lng  Longitude of the location (e.g. 77.20 for Delhi)
 * @returns    A fully-typed AQIReading with station info, AQI value, dominant pollutant, and individual pollutant readings.
 * @throws     Descriptive error when the API call fails or returns an error status.
 *
 * @example
 * ```ts
 * const reading = await fetchLiveAQI(28.6139, 77.2090);
 * console.log(reading.aqi);               // 156
 * console.log(reading.dominant_pollutant); // "PM2.5"
 * console.log(reading.pollutants);         // [{ name: "PM2.5", concentration: 85.3, ... }, ...]
 * ```
 */
export async function fetchLiveAQI(lat: number, lng: number): Promise<AQIReading> {
  try {
    const response = await waqiClient.get<WAQIFeedResponse>(
      `/feed/geo:${lat};${lng}/`
    );

    const { data } = response;

    if (data.status !== "ok" || !data.data) {
      throw new Error(
        `WAQI API returned an unexpected response (status: ${data.status})`
      );
    }

    const feed = data.data;

    // ── Extract station name and location info ────────────────────────────
    const stationName = feed.city?.name ?? "Unknown Station";

    // Parse city/area from the station name (WAQI format: "Area, City - Source")
    const { city, area } = parseStationName(stationName);

    // ── Build pollutant readings array ────────────────────────────────────
    const pollutants: PollutantReading[] = TRACKED_POLLUTANTS
      .filter((key) => feed.iaqi[key] !== undefined)
      .map((key) => {
        const meta = POLLUTANT_META[key];
        const value = feed.iaqi[key].v;

        return {
          name: meta.name,
          concentration: value,
          unit: meta.unit,
          // WAQI already returns sub-index values in iaqi, so concentration IS the sub-index
          sub_index: value,
        };
      });

    // ── Resolve dominant pollutant display name ───────────────────────────
    const dominantKey = feed.dominentpol ?? "";
    const dominantPollutant =
      POLLUTANT_META[dominantKey]?.name ?? dominantKey.toUpperCase() ?? "N/A";

    // ── Compose the final AQIReading ──────────────────────────────────────
    const reading: AQIReading = {
      station_name: stationName,
      city,
      area,
      aqi: feed.aqi,
      dominant_pollutant: dominantPollutant,
      pollutants,
      timestamp: feed.time?.iso ?? new Date().toISOString(),
      source: "WAQI",
    };

    return reading;
  } catch (error) {
    // Re-throw with a descriptive message for upstream consumers
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch live AQI for coordinates (${lat}, ${lng}): ${error.message}`
      );
    }
    throw new Error(
      `Failed to fetch live AQI for coordinates (${lat}, ${lng}): An unknown error occurred.`
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parses WAQI station name strings into city and area components.
 *
 * WAQI station names typically follow formats like:
 * - "ITO, Delhi - CPCB"
 * - "Anand Vihar, Delhi, India"
 * - "US Embassy, New Delhi"
 *
 * @param stationName  Raw station name from the WAQI API
 * @returns            Object with parsed city and area strings
 */
function parseStationName(stationName: string): { city: string; area: string } {
  // Remove common suffixes like " - CPCB", " - DPCC", " - IMD", etc.
  const cleaned = stationName.replace(/\s*-\s*(CPCB|DPCC|SPCB|IMD|IITM).*$/i, "").trim();

  const parts = cleaned.split(",").map((p) => p.trim());

  if (parts.length >= 2) {
    return {
      area: parts[0],
      city: parts[1],
    };
  }

  // Fallback: use the whole name as both city and area
  return {
    city: cleaned,
    area: cleaned,
  };
}

/**
 * Extracts flat pollutant values from an AQIReading for database storage.
 * Maps the pollutants array back to individual column values for the aqi_history table.
 */
export function extractPollutantValues(reading: AQIReading): {
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
} {
  const findValue = (name: string): number | null => {
    const pollutant = reading.pollutants.find((p) => p.name === name);
    return pollutant?.concentration ?? null;
  };

  return {
    pm25: findValue("PM2.5"),
    pm10: findValue("PM10"),
    no2: findValue("NO₂"),
    so2: findValue("SO₂"),
    co: findValue("CO"),
    o3: findValue("O₃"),
  };
}
