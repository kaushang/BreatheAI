/**
 * Ask Input Card
 *
 * A prominent input area for the "Ask AI" page.
 * Features:
 *   - Clean centered text input with placeholder
 *   - Sky-blue "Ask" submit button
 *   - Three suggestion chips as quick prompts
 *   - Clicking a chip fills the input with that question
 */

"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface AskInputCardProps {
  /** Current value of the question input (controlled) */
  value: string;
  /** Called whenever the input value changes */
  onChange: (value: string) => void;
  /** Called when the user submits a question */
  onSubmit: (question: string) => void;
}

/** Pre-defined suggestion prompts shown as clickable chips */
const SUGGESTIONS = [
  "Is it safe to take my child outside today?",
  "When is the best time to exercise tomorrow?",
  "Should I wear a mask today?",
] as const;

export default function AskInputCard({
  value,
  onChange,
  onSubmit,
}: AskInputCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <div id="ask-input-card">
      {/* ── Input Row ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-all duration-300 ${
            isFocused
              ? "border-sky-400/60 shadow-[0_0_0_3px_rgba(56,189,248,0.10)]"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <Sparkles className="h-4.5 w-4.5 shrink-0 text-sky-400/70" />

          <input
            id="ask-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="e.g. Is it safe to go for a run tomorrow morning?"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            autoComplete="off"
          />

          <button
            id="ask-submit-btn"
            type="submit"
            disabled={!value.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.97] disabled:opacity-40 disabled:hover:bg-sky-500 disabled:hover:shadow-sm disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            Ask
          </button>
        </div>
      </form>

      {/* ── Suggestion Chips ──────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mr-1">
          Try asking
        </span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onChange(suggestion)}
            className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/30 dark:hover:text-sky-400 active:scale-[0.97]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
