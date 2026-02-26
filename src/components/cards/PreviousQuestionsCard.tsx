/**
 * Previous Questions Card
 *
 * Displays a list of recently asked questions as clickable rows.
 * Each row shows the question text and a human-readable timestamp.
 * Clicking a row calls `onSelect` with that question, which the page
 * uses to re-populate the input field.
 */

"use client";

import { Clock, ChevronRight } from "lucide-react";

export interface PreviousQuestion {
  /** Unique id for the question */
  id: string;
  /** The question text */
  question: string;
  /** Human-readable relative timestamp, e.g. "2 hours ago" */
  timestamp: string;
}

interface PreviousQuestionsCardProps {
  /** List of previous questions to display */
  questions: PreviousQuestion[];
  /** Called when the user clicks a question row */
  onSelect: (question: string) => void;
}

export default function PreviousQuestionsCard({
  questions,
  onSelect,
}: PreviousQuestionsCardProps) {
  if (questions.length === 0) return null;

  return (
    <div id="previous-questions-card" className="mt-8">
      {/* Section heading */}
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <Clock className="h-3.5 w-3.5" />
        Recent Questions
      </h3>

      {/* Question rows */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
        {questions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(q.question)}
            className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left transition-all duration-200 hover:bg-muted/50 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
                {q.question}
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                {q.timestamp}
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-sky-500 transition-all duration-200 group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
