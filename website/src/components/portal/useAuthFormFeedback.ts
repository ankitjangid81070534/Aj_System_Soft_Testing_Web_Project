"use client";

import { useEffect, useRef, type FormEvent } from "react";

/** Local auth-form recovery only. Never retain passwords or serialize a draft. */
export function useAuthFormFeedback(status: "idle" | "error" | "success", pending: boolean) {
  const submitting = useRef(false);

  useEffect(() => {
    if (!pending) submitting.current = false;
  }, [pending]);

  return {
    onSubmit(event: FormEvent<HTMLFormElement>) {
      if (pending || submitting.current) {
        event.preventDefault();
        return;
      }
      submitting.current = true;
    },
    onReset(event: FormEvent<HTMLFormElement>) {
      // React also resets uncontrolled inputs for resolved action errors.
      // Let genuine success reset normally, but retain non-sensitive entries on failure.
      if (status !== "success") event.preventDefault();
      // Match names too: a revealed password has type="text".
      for (const input of event.currentTarget.querySelectorAll<HTMLInputElement>(
        'input[type="password"], input[name="password"], input[name="confirmPassword"]',
      )) input.value = "";
    },
  };
}
