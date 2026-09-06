"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  requestAppointmentAction,
  submitContactAction,
  submitQuoteAction,
  type LeadFormState,
} from "@/lib/leads/actions";

const idleLeadState: LeadFormState = { status: "idle" };

export const AGREEMENT_CONSENT_LABEL =
  "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.";

/**
 * Mandatory, never pre-checked agreement acceptance. `required` is enforced
 * client-side for immediate feedback and re-validated on the server, which
 * also records the accepted agreement version as evidence.
 */
export function AgreementCheckbox({ id, className }: { id: string; className?: string }) {
  return (
    <label
      htmlFor={id}
      className={`flex max-w-xl items-start gap-2.5 text-sm text-ink-muted ${className ?? ""}`}
    >
      <input
        id={id}
        name="agreementAccepted"
        type="checkbox"
        required
        defaultChecked={false}
        aria-describedby={`${id}-help`}
        className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
      />
      <span id={`${id}-help`}>
        {AGREEMENT_CONSENT_LABEL}{" "}
        <a
          href="/service-agreement"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-700 underline-offset-2 hover:underline focus-ring rounded-sm dark:text-brand-400"
        >
          View Agreement
        </a>
      </span>
    </label>
  );
}

/**
 * Hidden spam guards: a honeypot field bots love to fill, plus the render
 * timestamp used as a minimum fill-time check on the server.
 */
function GuardFields({ startedAt }: { startedAt: number }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="website-hp">Website</label>
        <input id="website-hp" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
    </>
  );
}

function SuccessPanel({
  message,
  onReset,
  resetLabel,
}: {
  message: string;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-2xl border border-success/20 bg-success-soft px-6 py-12 text-center"
    >
      <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-success" />
      <p className="text-lg font-semibold text-ink">{message}</p>
      <p className="max-w-md text-sm text-ink-muted">
        We reply to every genuine enquiry — usually within one business day.
      </p>
      <Button variant="secondary" onClick={onReset}>
        {resetLabel}
      </Button>
    </div>
  );
}

function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
    >
      {message}
    </p>
  );
}

function useLeadForm(action: (state: LeadFormState, formData: FormData) => Promise<LeadFormState>) {
  const [state, formAction, pending] = useActionState(action, idleLeadState);
  const [formKey, setFormKey] = useState(0);
  return { state, formAction, pending, formKey, reset: () => setFormKey((key) => key + 1) };
}

const CONTACT_TYPE_OPTIONS = [
  "Business website",
  "Web application / portal",
  "SaaS product",
  "Mobile app (Android / iOS)",
  "Windows desktop software",
  "ERP / CRM / business system",
  "POS / billing / inventory",
  "Hospital / clinic software",
  "Pharmacy software",
  "Hotel software",
  "API / integration work",
  "Existing software maintenance",
  "Something else",
] as const;

const PLATFORM_OPTIONS = [
  "Web",
  "Web + mobile",
  "Android",
  "iOS",
  "Windows desktop",
  "Not sure — advise me",
] as const;

const INDUSTRY_OPTIONS = [
  "Retail & shops",
  "Healthcare & clinics",
  "Pharmacy",
  "Hospitality (hotels/restaurants)",
  "Manufacturing",
  "Logistics & distribution",
  "Education",
  "Professional services",
  "Other",
] as const;

const BUDGET_OPTIONS = [
  "Under ₹50,000",
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000+",
  "Not sure yet",
] as const;

const TIMELINE_OPTIONS = [
  "ASAP",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "Just exploring",
] as const;

export function ContactForm({ startedAt }: { startedAt: number }) {
  const { state, formAction, pending, formKey, reset } = useLeadForm(submitContactAction);

  if (state.status === "success") {
    return (
      <SuccessPanel
        message={state.message ?? "Message sent."}
        onReset={reset}
        resetLabel="Send another message"
      />
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4" noValidate={false}>
      <GuardFields startedAt={startedAt} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="c-name" required>
          <Input
            id="c-name"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            invalid={state.status === "error" && !state.message?.includes("message")}
          />
        </Field>
        <Field label="Email" htmlFor="c-email" required>
          <Input
            id="c-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
          />
        </Field>
        <Field label="Phone" htmlFor="c-phone" required>
          <Input
            id="c-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            minLength={6}
            maxLength={20}
          />
        </Field>
        <Field label="Company / business" htmlFor="c-company" required>
          <Input
            id="c-company"
            name="company"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={160}
          />
        </Field>
      </div>
      <Field
        label="How can we help?"
        htmlFor="c-message"
        required
        hint="A couple of sentences about what you need built or fixed."
      >
        <Textarea id="c-message" name="message" required rows={5} maxLength={4000} />
      </Field>
      <AgreementCheckbox id="c-agreement" />
      <ErrorNote message={state.message} />
      <div>
        <Button type="submit" loading={pending}>
          <Send aria-hidden="true" className="h-4 w-4" />
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}

export function QuoteForm({ startedAt }: { startedAt: number }) {
  const { state, formAction, pending, formKey, reset } = useLeadForm(submitQuoteAction);

  if (state.status === "success") {
    return (
      <SuccessPanel
        message={state.message ?? "Request sent."}
        onReset={reset}
        resetLabel="Submit another request"
      />
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-6" noValidate={false}>
      <GuardFields startedAt={startedAt} />

      <fieldset className="flex flex-col gap-4" disabled={pending}>
        <legend className="text-sm font-semibold text-ink">1 · About you</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="q-name" required>
            <Input id="q-name" name="fullName" autoComplete="name" required maxLength={120} />
          </Field>
          <Field label="Company / business (optional)" htmlFor="q-company">
            <Input id="q-company" name="company" autoComplete="organization" maxLength={160} />
          </Field>
          <Field label="Email" htmlFor="q-email" required>
            <Input
              id="q-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
            />
          </Field>
          <Field label="Phone (optional)" htmlFor="q-phone">
            <Input id="q-phone" name="phone" type="tel" autoComplete="tel" maxLength={20} />
          </Field>
          <Field label="WhatsApp (optional)" htmlFor="q-whatsapp">
            <Input id="q-whatsapp" name="whatsapp" type="tel" maxLength={20} />
          </Field>
          <Field label="Location / city (optional)" htmlFor="q-location">
            <Input id="q-location" name="location" maxLength={160} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4" disabled={pending}>
        <legend className="text-sm font-semibold text-ink">2 · About the project</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project type" htmlFor="q-type" hint="Pick the closest match.">
            <Select id="q-type" name="projectType" defaultValue="">
              <option value="" disabled>
                Select a type…
              </option>
              {CONTACT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Target platform" htmlFor="q-platform">
            <Select id="q-platform" name="platform" defaultValue="">
              <option value="" disabled>
                Select a platform…
              </option>
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Industry" htmlFor="q-industry">
            <Select id="q-industry" name="industry" defaultValue="">
              <option value="" disabled>
                Select an industry…
              </option>
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Budget range (optional)" htmlFor="q-budget">
            <Select id="q-budget" name="budgetRange" defaultValue="">
              <option value="" disabled>
                Select a range…
              </option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Timeline (optional)" htmlFor="q-timeline">
            <Select id="q-timeline" name="timeline" defaultValue="">
              <option value="" disabled>
                Select a timeline…
              </option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Preferred contact method" htmlFor="q-preferred">
            <Select id="q-preferred" name="preferredContact" defaultValue="email">
              <option value="email">Email</option>
              <option value="phone">Phone call</option>
              <option value="whatsapp">WhatsApp</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Project requirements"
          htmlFor="q-requirements"
          required
          hint="What should the software do? Who will use it? What problems should it solve?"
        >
          <Textarea id="q-requirements" name="requirements" required rows={6} maxLength={8000} />
        </Field>
        <Field
          label="Attachment (optional)"
          htmlFor="q-attachment"
          hint="PDF, image or Word file, up to 10 MB — e.g. an existing spec or scope document."
        >
          <input
            id="q-attachment"
            name="attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
            className="block w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
          />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={pending}>
        <legend className="text-sm font-semibold text-ink">3 · Consent</legend>
        <label
          htmlFor="q-consent"
          className="flex max-w-xl items-start gap-2.5 text-sm text-ink-muted"
        >
          <input
            id="q-consent"
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-brand-600"
          />
          <span>
            I agree that {`AJ System Soft Technology`} may use these details to respond to my
            enquiry. No marketing lists, no sharing with third parties.
          </span>
        </label>
        <AgreementCheckbox id="q-agreement" className="mt-1" />
      </fieldset>

      <ErrorNote message={state.message} />
      <div>
        <Button type="submit" loading={pending}>
          <Send aria-hidden="true" className="h-4 w-4" />
          {pending ? "Submitting…" : "Request a quote"}
        </Button>
      </div>
    </form>
  );
}

export function AppointmentForm({ startedAt }: { startedAt: number }) {
  const { state, formAction, pending, formKey, reset } = useLeadForm(requestAppointmentAction);

  if (state.status === "success") {
    return (
      <SuccessPanel
        message={state.message ?? "Request sent."}
        onReset={reset}
        resetLabel="Request another slot"
      />
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4">
      <GuardFields startedAt={startedAt} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="a-name" required>
          <Input id="a-name" name="name" autoComplete="name" required maxLength={120} />
        </Field>
        <Field label="Email" htmlFor="a-email" required>
          <Input
            id="a-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
          />
        </Field>
        <Field label="Phone (optional)" htmlFor="a-phone">
          <Input id="a-phone" name="phone" type="tel" maxLength={20} />
        </Field>
        <Field label="Preferred date (optional)" htmlFor="a-date">
          <Input id="a-date" name="preferredDate" type="date" />
        </Field>
        <Field label="Preferred time (optional)" htmlFor="a-time">
          <Select id="a-time" name="preferredTime" defaultValue="">
            <option value="">Any time</option>
            <option value="Morning (9–12)">Morning (9–12)</option>
            <option value="Afternoon (12–5)">Afternoon (12–5)</option>
            <option value="Evening (5–8)">Evening (5–8)</option>
          </Select>
        </Field>
        <Field label="Topic (optional)" htmlFor="a-topic">
          <Input
            id="a-topic"
            name="topic"
            maxLength={160}
            placeholder="e.g. Discuss a POS system"
          />
        </Field>
      </div>
      <Field label="Anything to prepare? (optional)" htmlFor="a-message">
        <Textarea id="a-message" name="message" rows={3} maxLength={2000} />
      </Field>
      <ErrorNote message={state.message} />
      <div>
        <Button type="submit" loading={pending} variant="secondary">
          {pending ? "Requesting…" : "Request a consultation"}
        </Button>
      </div>
    </form>
  );
}
