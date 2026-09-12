"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import type { PortalActionState } from "@/lib/portal/actions";

/** Shared feedback for portal actions, without changing action results. */
export function PortalFeedback({
  state,
  focusOnError = false,
}: {
  state: PortalActionState;
  focusOnError?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusOnError && state.status === "error" && state.message) ref.current?.focus();
  }, [state, focusOnError]);

  if (!state.message) return null;
  const error = state.status === "error";
  const Icon = error ? CircleAlert : CheckCircle2;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={error ? "alert" : "status"}
      aria-atomic="true"
      className={`flex scroll-my-32 items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-6 [overflow-wrap:anywhere] focus-ring ${error ? "border-danger/20 bg-danger-soft text-danger" : "border-success/20 bg-success-soft text-success"}`}
    >
      <Icon aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
      <span>{state.message}</span>
    </div>
  );
}
