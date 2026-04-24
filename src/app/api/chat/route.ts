/**
 * POST /api/chat
 *
 * AQI chatbot backed by Google Gemini 2.5 Flash.
 * The route fetches live AQI + forecast + user health context, then calls Gemini.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const WAQI_API_KEY = process.env.WAQI_API_KEY || "";

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

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface ParsedGeminiAnswer {
  headline: string;
  explanation: string;
  alternative: string;
  aqi: number;
  category: string;
}

function aqiCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

function aqiAdvice(aqi: number): string {
  if (aqi <= 50) return "Air quality is clean. No precautions needed.";
  if (aqi <= 100) {
    return "Air quality is acceptable. Sensitive people should limit prolonged outdoor exertion.";
  }
  if (aqi <= 200) {
    return "Sensitive groups may experience health effects. General public is less likely to be affected.";
  }
  if (aqi <= 300) {
    return "Health alert: everyone may begin to feel effects. Sensitive groups should avoid outdoor activities.";
  }
  if (aqi <= 400) {
    return "Health warning: emergency conditions possible, broader population impact likely.";
  }
  return "Health emergency: avoid outdoor activities and stay indoors.";
}

async function fetchCurrentAQI(
  lat: number,
  lng: number,
): Promise<{ aqi: number; dominant: string }> {
  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();

    if (data.status === "ok") {
      return {
        aqi: Number(data.data.aqi ?? 150),
        dominant: String(data.data.dominentpol ?? "PM2.5"),
      };
    }
  } catch {
    // fall through
  }

  return { aqi: 150, dominant: "PM2.5" };
}

async function fetchForecast(city: string, lat: number, lng: number): Promise<number[]> {
  for (const baseUrl of ML_SERVICE_URLS) {
    try {
      const url = `${baseUrl}/forecast?city=${encodeURIComponent(city)}&lat=${lat}&lng=${lng}&hours=24`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      return (data.forecast as { aqi: number }[]).map((slot) => slot.aqi);
    } catch {
      // try next base URL
    }
  }

  return [];
}

function parseGeminiAnswer(
  rawText: string,
  currentAQI: number,
  category: string,
  advice: string,
): ParsedGeminiAnswer {
  const fallback: ParsedGeminiAnswer = {
    headline: `AQI ${currentAQI} (${category})`,
    explanation: advice,
    alternative: "Check the forecast and choose lower-AQI hours when possible.",
    aqi: currentAQI,
    category,
  };

  if (!rawText.trim()) return fallback;

  try {
    const parsed = JSON.parse(rawText) as Partial<ParsedGeminiAnswer>;
    return {
      headline: String(parsed.headline ?? fallback.headline),
      explanation: String(parsed.explanation ?? fallback.explanation),
      alternative: String(parsed.alternative ?? fallback.alternative),
      aqi: Number(parsed.aqi ?? fallback.aqi),
      category: String(parsed.category ?? fallback.category),
    };
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<ParsedGeminiAnswer>;
        return {
          headline: String(parsed.headline ?? fallback.headline),
          explanation: String(parsed.explanation ?? fallback.explanation),
          alternative: String(parsed.alternative ?? fallback.alternative),
          aqi: Number(parsed.aqi ?? fallback.aqi),
          category: String(parsed.category ?? fallback.category),
        };
      } catch {
        // fall through to plain-text handling
      }
    }

    return {
      ...fallback,
      explanation: rawText.slice(0, 700),
    };
  }
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 },
    );
  }

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

  const inputLat = Number(lat ?? 28.61);
  const inputLng = Number(lng ?? 77.21);
  const inputCity = String(city ?? "Delhi");

  const [aqiData, forecastAQIs, profileSnap] = await Promise.all([
    fetchCurrentAQI(inputLat, inputLng),
    fetchForecast(inputCity, inputLat, inputLng),
    adminDb.collection("users").doc(uid).get(),
  ]);

  const healthConditions: string[] = profileSnap.exists
    ? (profileSnap.data()?.health_conditions ?? [])
    : [];

  const cityName = profileSnap.exists
    ? (profileSnap.data()?.city ?? inputCity)
    : inputCity;

  const currentAQI = aqiData.aqi;
  const category = aqiCategory(currentAQI);
  const advice = aqiAdvice(currentAQI);

  let forecastSummary = "No forecast data available.";
  if (forecastAQIs.length > 0) {
    const best = Math.min(...forecastAQIs);
    const worst = Math.max(...forecastAQIs);
    const bestHour = forecastAQIs.indexOf(best);
    const worstHour = forecastAQIs.indexOf(worst);
    const avg = Math.round(
      forecastAQIs.reduce((sum, value) => sum + value, 0) / forecastAQIs.length,
    );

    forecastSummary = `Next 24h AQI range: ${best} (hour +${bestHour}) to ${worst} (hour +${worstHour}), average ${avg}.`;
  }

  const healthCtx =
    healthConditions.length > 0
      ? `User health conditions: ${healthConditions.join(", ")}. Add extra caution for these conditions.`
      : "User has no known health conditions.";

  const systemPrompt = `You are BreatheAI, an expert air quality health assistant for Indian cities.

CURRENT CONDITIONS (${cityName}):
- Current AQI: ${currentAQI} (${category})
- Dominant pollutant: ${aqiData.dominant.toUpperCase()}
- General guidance: ${advice}
- Forecast: ${forecastSummary}
- Health context: ${healthCtx}

Return JSON only (no markdown) in this shape:
{
  "headline": "short answer (max 10 words)",
  "explanation": "2-3 useful sentences, specific to the user question",
  "alternative": "one actionable alternative or next step",
  "aqi": ${currentAQI},
  "category": "${category}"
}

Rules:
- Use the user's exact question context, do not give generic repeated text.
- Be concise, practical, and AQI-specific.
- Never provide diagnosis.
`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: question.trim() }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 600,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[Chat] Gemini error:", {
        model: GEMINI_MODEL,
        status: geminiRes.status,
        errText,
      });
      return NextResponse.json(
        {
          error: "Gemini request failed.",
          details: `Model ${GEMINI_MODEL} returned status ${geminiRes.status}.`,
        },
        { status: 502 },
      );
    }

    const geminiData = (await geminiRes.json()) as GeminiResponse;
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = parseGeminiAnswer(rawText, currentAQI, category, advice);

    return NextResponse.json({
      question,
      headline: parsed.headline,
      explanation: parsed.explanation,
      alternative: parsed.alternative,
      aqi: parsed.aqi,
      category: parsed.category,
      source: "gemini",
      model: GEMINI_MODEL,
    });
  } catch (err) {
    console.error("[Chat] Gemini request exception:", err);
    return NextResponse.json(
      {
        error: "Gemini request failed.",
        details:
          "Could not complete chat response from Gemini. Check API key and connectivity.",
      },
      { status: 502 },
    );
  }
}
