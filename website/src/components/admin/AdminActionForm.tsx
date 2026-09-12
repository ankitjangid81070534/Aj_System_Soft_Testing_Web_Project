"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import type { AdminMutationResult, AdminMutationState } from "@/lib/admin/mutation-result";

export type AdminQuickAction = (formData: FormData) => Promise<AdminMutationResult | void>;

/** Keep action outcomes visible; legacy media actions retain their redirects. */
export function AdminActionForm({
  action,
  children,
  onSuccess,
  className,
}: {
  action: AdminQuickAction;
  children: ReactNode;
  onSuccess?: () => void;
  className?: string;
}) {
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const [state, formAction, pending] = useActionState<AdminMutationState, FormData>(
    async (_previous, formData) => {
      try {
        const result = await action(formData);
        if (result?.ok === false) return result;
        onSuccess?.();
        return result ?? { ok: null };
      } catch (error) {
        // Redirects/notFound must remain framework control flow, never fake errors.
        unstable_rethrow(error);
        return {
          ok: false,
          code: "DATABASE_ERROR",
          message: "The request could not be confirmed. Check the record before retrying.",
        };
      }
    },
    { ok: null },
  );

  useEffect(() => {
    if (state.ok === false) feedbackRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} aria-busy={pending} className={className}>
      <fieldset disabled={pending} className="min-w-0 border-0 p-0 disabled:opacity-60">
        {children}
      </fieldset>
      {pending ? <p role="status" className="mt-2 text-xs text-ink-muted">Working…</p> : null}
      {!pending && state.ok !== null && state.message ? (
        <p
          ref={feedbackRef}
          role={state.ok ? "status" : "alert"}
          aria-atomic="true"
          tabIndex={-1}
          className={`mt-2 max-w-sm text-sm break-words focus-ring ${state.ok ? "text-success" : "text-danger"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
