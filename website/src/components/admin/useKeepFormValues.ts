"use client";

import { useCallback, useRef, type FormEvent } from "react";

/**
 * React 19 resets every uncontrolled field after a form action settles — even
 * when the server answered with a validation or database error — so the admin
 * would lose everything they typed. Spread `onReset` on the <form> to cancel
 * those automatic resets; call `reset(form)` for the rare intentional one
 * (e.g. returning to the saved baseline after a genuine success).
 */
export function useKeepFormValues() {
  const allowReset = useRef(false);

  const onReset = useCallback((event: FormEvent<HTMLFormElement>) => {
    if (!allowReset.current) event.preventDefault();
  }, []);

  const reset = useCallback((form: HTMLFormElement | null) => {
    if (!form) return;
    allowReset.current = true;
    try {
      form.reset();
    } finally {
      allowReset.current = false;
    }
  }, []);

  return { onReset, reset };
}
