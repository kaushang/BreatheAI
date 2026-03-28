/**
 * POST /api/chat
 *
 * AQI Chatbot powered by Google Gemini 1.5 Flash.
 *
 * Flow:
 *  1. Receive user question + location (lat/lng/city)
 *  2. Fetch current AQI from WAQI via the existing /api/aqi/current route
 *  3. Fetch 24h forecast from the ML service
 *  4. Get user's health conditions from Firestore
 *  5. Build a rich context prompt and call Gemini
 *  6. Return a structured response (headline, explanation, alternative, aqi)
 *
 * Requires valid Firebase __session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";
const WAQI_API_KEY   = process.env.WAQI_API_KEY   || "";

// ─── NAQI helpers ─────────────────────────────────────────────────────────────

function aqiCategory(aqi: number): string {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

function aqiAdvice(aqi: number): string {
  if (aqi <= 50)  return "Air quality is clean. No precautions needed.";
  if (aqi <= 100) return "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.";
  if (aqi <= 200) return "Members of sensitive groups (children, elderly, people with asthma) may experience health effects. General public is less likely to be affected.";
  if (aqi <= 300) return "Health alert: everyone may begin to experience health effects. Sensitive groups should avoid outdoor activities.";
  if (aqi <= 400) return "Health warnings of emergency conditions. The entire population is more likely to be affected.";
  return "Health emergency: everyone should avoid outdoor activities. Stay indoors with windows closed.";
}

// ─── Fetch current AQI ────────────────────────────────────────────────────────

async function fetchCurrentAQI(lat: number, lng: number): Promise<{ aqi: number; dominant: string }> {
  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data.status === "ok") {
      return {
        aqi: data.data.aqi,
        dominant: data.data.dominentpol || "PM2.5",
      };
    }
  } catch { /* fall through */ }
  return { aqi: 150, dominant: "PM2.5" };
}

// ─── Fetch 24h forecast from ML service ──────────────────────────────────────

async function fetchForecast(city: string, lat: number, lng: number): Promise<number[]> {
  try {
    const url = `${ML_SERVICE_URL}/forecast?city=${encodeURIComponent(city)}&lat=${lat}&lng=${lng}&hours=24`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      return (data.forecast as { aqi: number }[]).map((s) => s.aqi);
    }
  } catch { /* fall through */ }
  return [];
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  // Auth check
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const body = await request.json();
  const { question, lat, lng, city } = body as {
    question: string;
    lat: number;
    lng: number;
    city: string;
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // Fetch context data in parallel
  const [aqiData, forecastAQIs, profileSnap] = await Promise.all([
    fetchCurrentAQI(lat ?? 28.61, lng ?? 77.21),
    fetchForecast(city ?? "Delhi", lat ?? 28.61, lng ?? 77.21),
    adminDb.collection("users").doc(uid).get(),
  ]);

  const healthConditions: string[] = profileSnap.exists
    ? (profileSnap.data()?.health_conditions ?? [])
    : [];
  const cityName = profileSnap.exists
    ? (profileSnap.data()?.city ?? city ?? "your city")
    : (city ?? "your city");

  const currentAQI = aqiData.aqi;
  const category   = aqiCategory(currentAQI);
  const advice     = aqiAdvice(currentAQI);

  // Build 24h forecast summary
  let forecastSummary = "No forecast data available.";
  if (forecastAQIs.length > 0) {
    const best = Math.min(...forecastAQIs);
    const worst = Math.max(...forecastAQIs);
    const bestHour = forecastAQIs.indexOf(best);
    const worstHour = forecastAQIs.indexOf(worst);
    forecastSummary = `Over the next 24 hours, AQI will range from ${best} (at hour +${bestHour}, ${aqiCategory(best)}) to ${worst} (at hour +${worstHour}, ${aqiCategory(worst)}). The average predicted AQI is ${Math.round(forecastAQIs.reduce((a,b) => a+b, 0) / forecastAQIs.length)}.`;
  }

  const healthCtx = healthConditions.length > 0
    ? `The user has the following health conditions: ${healthConditions.join(", ")}. Tailor advice accordingly with extra caution.`
    : "The user has no known health conditions.";

  // Gemini system prompt
  const systemPrompt = `You are BreatheAI, an expert air quality health assistant for Indian cities. 
You respond to questions about AQI (Air Quality Index), outdoor safety, and health precautions.

CURRENT CONDITIONS for ${cityName}:
- Current AQI: ${currentAQI} (${category})
- Dominant pollutant: ${aqiData.dominant.toUpperCase()}
- General advice: ${advice}
- 24-hour forecast: ${forecastSummary}
- User health: ${healthCtx}

RESPONSE FORMAT (JSON only, no markdown):
{
  "headline": "One short decisive sentence (max 10 words)",
  "explanation": "2-3 sentences explaining the AQI situation and why your recommendation makes sense. Be specific about the AQI value and category.",
  "alternative": "One concrete alternative suggestion if their plan is risky, or a positive recommendation if conditions are good.",
  "aqi": ${currentAQI},
  "category": "${category}"
}

Rules:
- Always be specific with AQI numbers and category names
- If AQI ≤ 100: generally encourage outdoor activity with minor caveats
- If AQI 101–200: advise sensitive groups to be cautious, general public can proceed carefully
- If AQI > 200: discourage outdoor activity, especially for sensitive groups
- Never give medical diagnoses
- Keep response concise and actionable`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: question }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[Chat] Gemini error:", errText);
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Gemini sometimes wraps in markdown despite responseMimeType
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    return NextResponse.json({
      question,
      headline:    parsed.headline    ?? "Check current AQI before heading out",
      explanation: parsed.explanation ?? advice,
      alternative: parsed.alternative ?? "Stay informed with real-time data.",
      aqi:         Number(parsed.aqi ?? currentAQI),
      category:    String(parsed.category ?? category),
    });
  } catch (err) {
    console.error("[Chat] Error:", err);
    // Graceful fallback — return rule-based response
    return NextResponse.json({
      question,
      headline:    currentAQI <= 100 ? "Generally safe with precautions" : "Caution advised today",
      explanation: `Current AQI in ${cityName} is ${currentAQI} (${category}). ${advice}`,
      alternative: forecastAQIs.length > 0
        ? `Consider going out at hour +${forecastAQIs.indexOf(Math.min(...forecastAQIs))} when AQI drops to ${Math.min(...forecastAQIs)}.`
        : "Check the Forecast page for the best time to go out.",
      aqi:      currentAQI,
      category,
    });
  }
}
