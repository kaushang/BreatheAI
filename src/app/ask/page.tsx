/**
 * Ask AI Page
 *
 * Conversational AI assistant for air quality questions.
 * Users can ask health-related queries about AQI, pollution, and outdoor safety.
 *
 * Layout:
 *   1. Page header — "Ask AI" heading + subheading
 *   2. AskInputCard — prominent input with suggestion chips
 *   3. AIResponseCard — mock response pre-populated with a sample Q&A
 *   4. PreviousQuestionsCard — recent questions as clickable rows
 *
 * All data is hardcoded mock data for now — no backend connection.
 */

"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AskInputCard from "@/components/cards/AskInputCard";
import AIResponseCard from "@/components/cards/AIResponseCard";
import PreviousQuestionsCard from "@/components/cards/PreviousQuestionsCard";
import type { PreviousQuestion } from "@/components/cards/PreviousQuestionsCard";
import { MessageSquareText } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

/** Pre-populated mock response (shown as if a question was already asked) */
const MOCK_RESPONSE = {
  question: "Is it safe to go for a run tomorrow morning?",
  headline: "Not recommended tomorrow morning",
  explanation:
    "AQI is predicted to be around 210 (Poor) tomorrow morning in Anand Vihar. For someone with your health profile, prolonged outdoor exercise is not advisable. PM2.5 levels will be elevated.",
  alternative:
    "Consider exercising indoors or wait until after 7 PM when AQI is expected to drop to around 110 (Moderate).",
  aqi: 210,
};

/** Hardcoded recent questions */
const MOCK_PREVIOUS_QUESTIONS: PreviousQuestion[] = [
  {
    id: "q1",
    question: "What will the air quality be like this weekend?",
    timestamp: "2 hours ago",
  },
  {
    id: "q2",
    question: "Is it safe for my mother with asthma to go for a walk?",
    timestamp: "Yesterday, 4:30 PM",
  },
  {
    id: "q3",
    question: "Should I keep my windows open tonight?",
    timestamp: "2 days ago",
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AskAIPage() {
  const [query, setQuery] = useState("");

  function handleSubmit(question: string) {
    // In the future this would call the AI backend
    console.log("Submitted question:", question);
  }

  return (
    <DashboardLayout>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <header id="ask-header" className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <MessageSquareText className="h-5 w-5 text-sky-500" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground font-heading tracking-tight">
            Ask AI
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask anything about your air quality in plain English
        </p>
      </header>

      {/* ── Input Area ─────────────────────────────────────────────────────── */}
      <section id="section-ask-input" className="mb-8">
        <AskInputCard
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
        />
      </section>

      {/* ── Mock AI Response ───────────────────────────────────────────────── */}
      <section id="section-ai-response" className="mb-6">
        <AIResponseCard
          question={MOCK_RESPONSE.question}
          headline={MOCK_RESPONSE.headline}
          explanation={MOCK_RESPONSE.explanation}
          alternative={MOCK_RESPONSE.alternative}
          aqi={MOCK_RESPONSE.aqi}
        />
      </section>

      {/* ── Previous Questions ─────────────────────────────────────────────── */}
      <section id="section-previous-questions" className="mb-8">
        <PreviousQuestionsCard
          questions={MOCK_PREVIOUS_QUESTIONS}
          onSelect={setQuery}
        />
      </section>

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <div className="text-center text-[10px] text-muted-foreground/40 pb-4">
        Responses are AI-generated based on forecast data · Not medical advice ·
        Always consult a healthcare professional
      </div>
    </DashboardLayout>
  );
}
