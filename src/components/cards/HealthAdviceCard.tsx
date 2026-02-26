/**
 * Health Advice Card
 *
 * Displays a personalized health advisory based on:
 *   1. The current AQI category (from NAQI constants)
 *   2. The user's health conditions (from their Supabase profile)
 *
 * Uses the getHealthAdvice() service to generate context-aware messages
 * and precautions. Adapts its visual styling to the severity level.
 */

"use client";

import { getNAQICategory } from "@/constants/naqi";
import { getHealthAdvice } from "@/services/healthAdvice";
import { ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";

interface HealthAdviceCardProps {
  /** Current AQI value */
  aqi: number;
  /** User's health conditions from their profile (e.g. ["asthma", "heart_disease"]) */
  healthConditions: string[];
}

/** Map condition keys to human-readable labels for the badge display. */
const CONDITION_LABELS: Record<string, string> = {
  asthma: "Asthma",
  copd: "COPD",
  heart_disease: "Heart Disease",
  allergies: "Allergies",
  diabetes: "Diabetes",
  pregnancy: "Pregnancy",
  elderly: "Elderly",
  children: "Children",
};

export default function HealthAdviceCard({
  aqi,
  healthConditions,
}: HealthAdviceCardProps) {
  const category = getNAQICategory(aqi);
  const categoryName = category?.category ?? "Unknown";
  const advice = getHealthAdvice(categoryName, healthConditions);

  // Determine severity for visual treatment
  const isSevere = ["Poor", "Very Poor", "Severe"].includes(categoryName);

  return (
    <div
      id="health-advice-card"
      className={`rounded-2xl border p-6 transition-all duration-300 ${
        isSevere
          ? "border-destructive/30 bg-destructive/[0.04]"
          : "border-border bg-card"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isSevere ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-primary" />
          )}
          Health Advisory
        </h3>
        <span className="text-xl" aria-hidden>
          {advice.icon}
        </span>
      </div>

      {/* Headline */}
      <h4
        className={`text-lg font-semibold mb-2 ${
          isSevere ? "text-destructive" : "text-foreground"
        }`}
      >
        {advice.headline}
      </h4>

      {/* Personalized message */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {advice.message}
      </p>

      {/* Active health conditions badges */}
      {healthConditions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {healthConditions.map((condition) => (
            <span
              key={condition}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider"
            >
              {CONDITION_LABELS[condition] ?? condition}
            </span>
          ))}
        </div>
      )}

      {/* Precautions list */}
      {advice.precautions.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Precautions
          </span>
          <ul className="space-y-1.5">
            {advice.precautions.map((precaution, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                <span>{precaution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
