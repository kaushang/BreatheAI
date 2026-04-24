/**
 * GET /api/forecast/[city]
 *
 * Next.js proxy route that forwards forecast requests to the Python ML
 * microservice. Adds Firebase authentication check and handles ML service
 * downtime gracefully by returning an informative error.
 *
 * Query params forwarded: lat, lng, hours
 * Requires: valid Firebase __session cookie (authenticated user only)
 */

import { NextRequest, NextResponse } from "next/server";

const ML_SERVICE_URLS = Array.from(
  new Set(
    [
      process.env.ML_SERVICE_URL,
      "http://127.0.0.1:8081",
      "http://localhost:8081",
      "http://127.0.0.1:8001",
      "http://localhost:8001",
    ].filter((url): url is string => Boolean(url)),
  ),
);

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  // Auth check — must have a session cookie
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat   = searchParams.get("lat");
  const lng   = searchParams.get("lng");
  const hours = searchParams.get("hours") || "48";
  const city  = params.city;

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing required parameters: lat, lng" },
      { status: 400 }
    );
  }

  try {
    let lastNetworkError: unknown = null;

    for (const baseUrl of ML_SERVICE_URLS) {
      const mlUrl = `${baseUrl}/forecast?city=${encodeURIComponent(city)}&lat=${lat}&lng=${lng}&hours=${hours}`;
      try {
        const mlRes = await fetch(mlUrl, {
          next: { revalidate: 0 }, // always fresh
          signal: AbortSignal.timeout(10_000), // 10s timeout
        });

        if (!mlRes.ok) {
          const errText = await mlRes.text();
          // Try next candidate when endpoint is missing on this candidate.
          if (mlRes.status === 404) {
            continue;
          }
          console.error("[Forecast Proxy] ML service error:", {
            baseUrl,
            status: mlRes.status,
            errText,
          });
          return NextResponse.json(
            { error: "ML service returned an error", details: errText },
            { status: mlRes.status },
          );
        }

        const data = await mlRes.json();
        return NextResponse.json(data);
      } catch (err) {
        lastNetworkError = err;
      }
    }

    throw lastNetworkError ?? new Error("No ML service candidate responded.");
  } catch (err) {
    console.error("[Forecast Proxy] Could not reach ML service:", err);
    return NextResponse.json(
      {
        error: "ML service unavailable",
        hint: "Start ML service and/or set ML_SERVICE_URL. Example: cd ml-service && uvicorn main:app --port 8081",
        attempted_urls: ML_SERVICE_URLS,
      },
      { status: 503 }
    );
  }
}
