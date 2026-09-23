"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { useKeepFormValues } from "./useKeepFormValues";

/**
 * Drop-in <form> for server-action forms rendered by admin Server Components.
 * Typed values survive any error redirect; pass `resetOn` (e.g. the success
 * notice) to clear the fields only once a save genuinely succeeded.
 */
export function PreservingForm({
  resetOn,
  ...props
}: ComponentProps<"form"> & { resetOn?: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { onReset, reset } = useKeepFormValues();

  useEffect(() => {
    if (resetOn) reset(formRef.current);
  }, [resetOn, reset]);

  return <form ref={formRef} onReset={onReset} {...props} />;
}
