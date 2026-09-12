"use client";

import { useEffect, useRef } from "react";

type FeedbackState = { ok: boolean | null; message?: string };

/** Displays the server result, never infers a successful save from a click. */
export function AdminFeedback({ state }: { state: FeedbackState }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.ok === false && state.message) ref.current?.focus();
  }, [state]);

  if (state.ok === null || !state.message) return null;

  return (
    <p
      ref={ref}
      role={state.ok ? "status" : "alert"}
      aria-atomic="true"
      tabIndex={-1}
      className={`min-w-0 rounded-xl border px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere] focus-ring ${
        state.ok
          ? "border-success/20 bg-success-soft text-success"
          : "border-danger/20 bg-danger-soft text-danger"
      }`}
    >
      {state.message}
    </p>
  );
}
