"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

const subscribe = () => () => {};
const steps = ["Project", "Requirements", "Contact", "Review & consent"] as const;
const reviewFields = [
  ["projectType", "Project type"],
  ["platform", "Platform"],
  ["industry", "Industry"],
  ["budgetRange", "Budget preference"],
  ["timeline", "Timeline preference"],
  ["requirements", "Project requirements"],
  ["fullName", "Full name"],
  ["company", "Company"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp"],
  ["location", "Location"],
  ["preferredContact", "Contact method"],
] as const;

type Props = {
  action: (data: FormData) => void;
  pending: boolean;
  message?: string;
  guards: ReactNode;
  project: ReactNode;
  requirements: ReactNode;
  contact: ReactNode;
  consent: ReactNode;
};

/** Presentation only: every existing field stays mounted in one native form. */
export function QuoteWizard({
  action,
  pending,
  message,
  guards,
  project,
  requirements,
  contact,
  consent,
}: Props) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [step, setStep] = useState(0);
  const [review, setReview] = useState<[string, string][]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!pending) {
      submittingRef.current = false;
      if (message) errorRef.current?.focus();
    }
  }, [pending, message]);

  function goTo(next: number) {
    if (pending) return;
    if (next === 3 && formRef.current) {
      const data = new FormData(formRef.current);
      const values: [string, string][] = reviewFields.map(([name, label]) => [
        label,
        String(data.get(name) ?? "") || "Not provided",
      ]);
      const file = data.get("attachment");
      values.push([
        "Attachment",
        file instanceof File && file.size > 0 ? file.name : "None selected",
      ]);
      setReview(values);
    }
    flushSync(() => setStep(next));
    headingRef.current?.focus();
  }

  function validate(index: number) {
    const controls = formRef.current?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(
      `[data-quote-step="${index}"] input, [data-quote-step="${index}"] select, [data-quote-step="${index}"] textarea`,
    );
    for (const control of controls ?? []) {
      // Trim-aware minimums match the unchanged server schema.
      const minimum = control.name === "requirements" ? 20 : control.name === "fullName" ? 2 : 0;
      control.setCustomValidity(
        minimum && control.value.trim().length < minimum
          ? `Please enter at least ${minimum} characters.`
          : "",
      );
      if (!control.checkValidity()) {
        goTo(index);
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    return true;
  }

  function next() {
    if (validate(step)) goTo(step + 1);
  }

  return (
    <form
      ref={formRef}
      action={action}
      data-quote-wizard={hydrated ? "ready" : "full-form"}
      className="flex min-w-0 flex-col gap-6"
      noValidate={hydrated}
      aria-busy={pending}
      // React resets uncontrolled inputs after any resolved action, including an
      // error result. Keep the mounted brief/file until a genuine success unmounts it.
      onReset={(event) => event.preventDefault()}
      onInput={(event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
          target.setCustomValidity("");
      }}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          !event.nativeEvent.isComposing &&
          step < 3 &&
          event.target instanceof HTMLInputElement &&
          !["checkbox", "file"].includes(event.target.type)
        ) {
          event.preventDefault();
          if (!pending) next();
        }
      }}
      onSubmit={(event) => {
        if (pending || submittingRef.current) {
          event.preventDefault();
          return;
        }
        if (hydrated && step < 3) {
          event.preventDefault();
          next();
          return;
        }
        for (let index = 0; index < steps.length; index++) {
          if (!validate(index)) {
            event.preventDefault();
            return;
          }
        }
        submittingRef.current = true;
      }}
    >
      {guards}
      {hydrated && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-canvas-raised p-4">
          <ol
            aria-label="Project planner progress"
            className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"
          >
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index === step ? "step" : undefined}
                className={index === step ? "font-semibold text-ink" : "text-ink-muted"}
              >
                {index + 1} · {label}
              </li>
            ))}
          </ol>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-32 text-lg font-semibold text-ink focus-ring"
            aria-live="polite"
          >
            Step {step + 1} of 4: {steps[step]}
          </h2>
          <p className="text-sm text-ink-muted">
            Nothing is sent until you choose Request a quote. Answers stay here while you move
            between steps, but are not saved if you leave or reload.
          </p>
        </div>
      )}
      {[project, requirements, contact, consent].map((content, index) => (
        <div
          key={steps[index]}
          data-quote-step={index}
          style={hydrated && step !== index ? { display: "none" } : undefined}
        >
          {index === 3 && hydrated && (
            <div className="mb-6 flex flex-col gap-4">
              <p className="text-sm text-ink-muted">
                Review your details before submitting. Budget and timeline are preferences, not a
                price or delivery commitment.
              </p>
              <dl className="grid gap-3 rounded-2xl border border-line bg-canvas-raised p-4 sm:grid-cols-2">
                {review.map(([label, value]) => (
                  <div
                    key={label}
                    className={
                      label === "Project requirements" ? "min-w-0 sm:col-span-2" : "min-w-0"
                    }
                  >
                    <dt className="text-xs font-semibold text-ink-muted">{label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink [overflow-wrap:anywhere]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2">
                {steps.slice(0, 3).map((label, index) => (
                  <Button
                    key={label}
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => goTo(index)}
                  >
                    Edit {label.toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {content}
        </div>
      ))}
      {message && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger focus-ring"
        >
          {message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {hydrated && step > 0 && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => goTo(step - 1)}
          >
            Back
          </Button>
        )}
        {hydrated && step < 3 ? (
          <Button type="button" disabled={pending} onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={pending}>
            <Send aria-hidden="true" className="h-4 w-4" />
            {pending ? "Submitting…" : "Request a quote"}
          </Button>
        )}
      </div>
    </form>
  );
}
