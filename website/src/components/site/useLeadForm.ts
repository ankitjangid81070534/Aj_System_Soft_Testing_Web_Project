"use client";

import { useActionState, useEffect, useRef, type FormEvent } from "react";
import type { LeadFormState } from "@/lib/leads/actions";

const idleState: LeadFormState = { status: "idle" };

/** Contact/consultation attempt only; server validation remains authoritative. */
export function useLeadForm(
  action: (state: LeadFormState, data: FormData) => Promise<LeadFormState>,
) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!pending) {
      submittingRef.current = false;
      if (state.status === "error") errorRef.current?.focus();
    }
  }, [pending, state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (pending || submittingRef.current) {
      event.preventDefault();
      return;
    }
    const controls = event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input, textarea",
    );
    for (const control of controls) {
      const value = control.value.trim();
      const minimum = control.minLength;
      let message = "";
      if (minimum > 0 && (control.required || control.value !== "") && value.length < minimum)
        message = `Please enter at least ${minimum} characters.`;
      if (control.name === "phone" && control.value !== "" && !/^[+()\-.\s0-9]{6,20}$/.test(value))
        message = "Enter a valid phone number";
      control.setCustomValidity(message);
      if (!control.checkValidity()) {
        event.preventDefault();
        control.reportValidity();
        control.focus();
        return;
      }
    }
    submittingRef.current = true;
  }

  function onInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
      target.setCustomValidity("");
  }

  return {
    state,
    formAction,
    pending,
    errorRef,
    formProps: {
      onSubmit,
      onInput,
      // React resets uncontrolled fields even when an action resolves to an error.
      // Genuine success unmounts this attempt's form instead.
      onReset: (event: FormEvent<HTMLFormElement>) => event.preventDefault(),
      "aria-busy": pending,
    },
  };
}
