"use client";

import { useActionState, useState } from "react";
import { Send, Star } from "lucide-react";
import {
  submitPublicReviewAction,
  type PublicReviewState,
} from "@/lib/ajsystemsoft_in_public-review-actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { GuardFields } from "./LeadForms";

const initialState: PublicReviewState = { status: "idle" };
const renderedAt = () => Date.now();

export function PublicReviewForm() {
  const [state, action, pending] = useActionState(submitPublicReviewAction, initialState);
  const [startedAt] = useState(renderedAt);
  const [rating, setRating] = useState(5);

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-2xl border border-line bg-canvas p-6 text-center text-sm font-medium text-ink">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} aria-busy={pending} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Your rating</legend>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              className="rounded-md p-1 focus-ring"
            >
              <Star
                aria-hidden="true"
                className={`h-7 w-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-ink-muted"}`}
              />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Your name" htmlFor="pr-name" required>
          <Input id="pr-name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
        </Field>
        <Field label="Company (optional)" htmlFor="pr-company">
          <Input id="pr-company" name="company" maxLength={120} autoComplete="organization" />
        </Field>
        <Field label="Role (optional)" htmlFor="pr-role">
          <Input id="pr-role" name="role" maxLength={120} placeholder="e.g. Founder" />
        </Field>
      </div>
      <Field label="Review title" htmlFor="pr-title" required>
        <Input id="pr-title" name="title" required minLength={3} maxLength={120} placeholder="What stood out?" />
      </Field>
      <Field
        label="Your experience"
        htmlFor="pr-text"
        required
        hint="Reviews are published only after our team verifies them."
      >
        <Textarea id="pr-text" name="reviewText" required minLength={20} maxLength={2000} rows={5} />
      </Field>
      <GuardFields startedAt={startedAt} resetKey={state} />
      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-danger">{state.message}</p>
      ) : null}
      <Button type="submit" loading={pending}>
        {pending ? "Submitting…" : "Submit review"}
        {!pending ? <Send aria-hidden="true" className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
