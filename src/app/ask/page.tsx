/**
 * Ask AI Page — Live Implementation
 *
 * Wires the AskInputCard + AIResponseCard to the /api/chat route.
 * Users ask natural language questions; the page fetches context (AQI +
 * 48h forecast + user health profile) and returns a Gemini-powered answer.
 *
 * States:
 *   idle      — shows suggestion chips, previous questions
 *   loading   — skeleton pulse in AIResponseCard slot
 *   answered  — shows actual AI response
 *   error     — shows inline error banner
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AskInputCard from "@/components/cards/AskInputCard";
import AIResponseCard from "@/components/cards/AIResponseCard";
import PreviousQuestionsCard from "@/components/cards/PreviousQuestionsCard";
import type { PreviousQuestion } from "@/components/cards/PreviousQuestionsCard";
import { MessageSquareText, Loader2, AlertCircle } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatResponse {
  question: string;
  headline: string;
  explanation: string;
  alternative: string;
  aqi: number;
  category: string;
}

interface UserLocation {
  city: string;
  lat: number;
  lng: number;
}

// ─── Suggestion seeds ─────────────────────────────────────────────────────────

const RECENT_SUGGESTIONS: PreviousQuestion[] = [
  {
    id: "s1",
    question: "Is it safe to go for a run right now?",
    timestamp: "Try asking",
  },
  {
    id: "s2",
    question: "Can my child play outside today?",
    timestamp: "Try asking",
  },
  {
    id: "s3",
    question: "Should I wear a mask to commute today?",
    timestamp: "Try asking",
  },
  {
    id: "s4",
    question: "What precautions should I take with my asthma?",
    timestamp: "Try asking",
  },
  {
    id: "s5",
    question: "When is the best time to exercise outdoors tomorrow?",
    timestamp: "Try asking",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AskAIPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<UserLocation>({
    city: "Delhi",
    lat: 28.61,
    lng: 77.21,
  });
  const [history, setHistory] = useState<PreviousQuestion[]>([]);

  // Load user's location from Firestore on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      try {
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setLocation({
            city: data.city ?? "Delhi",
            lat: data.lat ?? 28.61,
            lng: data.lng ?? 77.21,
          });
        }
      } catch {
        /* use defaults */
      }
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = useCallback(
    async (question: string) => {
      if (!question.trim()) return;
      setError("");
      setLoading(true);
      setResponse(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, ...location }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const message =
            typeof errData?.details === "string"
              ? `${errData.error ?? "Request failed"} ${errData.details}`
              : (errData.error ?? `Server error ${res.status}`);
          throw new Error(message);
        }

        const data: ChatResponse = await res.json();
        setResponse(data);

        // Add to local history
        setHistory((prev) => [
          { id: Date.now().toString(), question, timestamp: "Just now" },
          ...prev.slice(0, 9),
        ]);
      } catch (err) {
        console.error("[Ask AI] Error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [location],
  );

  return (
    <DashboardLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header id="ask-header" className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <MessageSquareText className="h-5 w-5 text-sky-500" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
            Ask AI
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask anything about your air quality in plain English — powered by
          Gemini AI
        </p>
      </header>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <section id="section-ask-input" className="mb-8">
        <AskInputCard
          value={query}
          onChange={setQuery}
          onSubmit={(q) => {
            setQuery(q);
            handleSubmit(q);
          }}
        />
      </section>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <section className="mb-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Loader2 className="h-3.5 w-3.5 text-sky-500 animate-spin" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-sky-500 uppercase">
                breatheAI is thinking…
              </span>
            </div>
            <div className="h-4 w-3/4 rounded bg-muted/60" />
            <div className="h-6 w-1/2 rounded bg-muted/60" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted/40" />
              <div className="h-3 w-5/6 rounded bg-muted/40" />
              <div className="h-3 w-4/6 rounded bg-muted/40" />
            </div>
          </div>
        </section>
      )}

      {/* ── AI Response ──────────────────────────────────────────────────── */}
      {response && !loading && (
        <section id="section-ai-response" className="mb-6">
          <AIResponseCard
            question={response.question}
            headline={response.headline}
            explanation={response.explanation}
            alternative={response.alternative}
            aqi={response.aqi}
          />
        </section>
      )}

      {/* ── Suggestion / History ─────────────────────────────────────────── */}
      <section id="section-previous-questions" className="mb-8">
        <PreviousQuestionsCard
          questions={history.length > 0 ? history : RECENT_SUGGESTIONS}
          onSelect={(q) => {
            setQuery(q);
            handleSubmit(q);
          }}
        />
      </section>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Responses are AI-generated using live AQI + forecast data · Not medical
        advice · Always consult a healthcare professional
      </div>
    </DashboardLayout>
  );
}
