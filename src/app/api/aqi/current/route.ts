/**
 * GET /api/aqi/current
 *
 * Next.js Route Handler that returns the current live AQI reading for a
 * given geographic coordinate pair. The result is also persisted to the
 * `aqi_history` collection in Firestore for trend analysis and dashboards.
 *
 * Query Parameters:
 *   - lat (required): Latitude  (e.g. 28.61)
 *   - lng (required): Longitude (e.g. 77.20)
 *
 * Response:
 *   200 — { success: true,  data: AQIReading }
 *   400 — { success: false, error: "..." }   (invalid parameters)
 *   500 — { success: false, error: "..." }   (upstream API or DB failure)
 *
 * Example:
 *   GET /api/aqi/current?lat=28.6139&lng=77.2090
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchLiveAQI, extractPollutantValues } from "@/services/waqi";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // ── 1. Parse & validate query parameters ──────────────────────────────
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    if (!latParam || !lngParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameters: lat and lng",
        },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          success: false,
          error: "lat and lng must be valid numeric values",
        },
        { status: 400 }
      );
    }

    // Basic bounds check for Indian coordinates (generous range)
    if (lat < 6 || lat > 38 || lng < 67 || lng > 98) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Coordinates appear to be outside India. BreatheAI currently supports Indian locations only.",
        },
        { status: 400 }
      );
    }

    // ── 2. Fetch live AQI from WAQI API ───────────────────────────────────
    const reading = await fetchLiveAQI(lat, lng);

    // ── 3. Persist to Firestore aqi_history collection ─────────────────────────
    const pollutantValues = extractPollutantValues(reading);

    try {
      await adminDb.collection("aqi_history").add({
        city: reading.city,
        area: reading.area,
        station_name: reading.station_name,
        aqi: reading.aqi,
        dominant_pollutant: reading.dominant_pollutant,
        pm25: pollutantValues.pm25,
        pm10: pollutantValues.pm10,
        no2: pollutantValues.no2,
        so2: pollutantValues.so2,
        co: pollutantValues.co,
        o3: pollutantValues.o3,
        fetched_at: new Date().toISOString(),
      });
    } catch (dbError) {
      // Log but don't fail the request — AQI data is still valid
      console.error("[AQI Current] Firestore insert error:", dbError);
    }

    // ── 4. Return the AQI reading ─────────────────────────────────────────
    return NextResponse.json(
      { success: true, data: reading },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AQI Current] Error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
