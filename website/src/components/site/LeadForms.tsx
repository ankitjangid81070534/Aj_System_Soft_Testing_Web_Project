"use client";

import { useActionState, useEffect, useId, useState, type Ref } from "react";
import { useLeadForm } from "./useLeadForm";
import { CalendarCheck, CheckCircle2, Send } from "lucide-react";
import { BookingSlotPicker } from "./BookingSlotPicker";
import bookingStyles from "./booking.module.css";
import { describeDate, slotKey, slotLabel, upcomingBookingDates } from "@/lib/booking/slots";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { QuoteWizard } from "./QuoteWizard";
import {
  getBookedSlotsAction,
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
  const honeypotId = useId();
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} type="text" name="website" tabIndex={-1} autoComplete="off" />
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

function ErrorNote({ message, errorRef }: { message?: string; errorRef: Ref<HTMLParagraphElement> }) {
  if (!message) return null;
  return (
    <p
      ref={errorRef}
      tabIndex={-1}
      role="alert"
      aria-live="polite"
      className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger focus-ring"
    >
      {message}
    </p>
  );
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
  const [attempt, setAttempt] = useState(0);
  return (
    <ContactFormAttempt
      key={attempt}
      startedAt={startedAt}
      onReset={() => setAttempt((value) => value + 1)}
    />
  );
}

function ContactFormAttempt({ startedAt, onReset }: { startedAt: number; onReset: () => void }) {
  const { state, formAction, pending, errorRef, formProps } = useLeadForm(submitContactAction);

  if (state.status === "success") {
    return (
      <SuccessPanel
        message={state.message ?? "Message sent."}
        onReset={onReset}
        resetLabel="Send another message"
      />
    );
  }

  return (
    <form action={formAction} {...formProps} className="flex flex-col gap-4">
      <GuardFields startedAt={startedAt} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="c-name" required>
          <Input
            id="c-name"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            minLength={2}
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
        <Textarea id="c-message" name="message" required minLength={10} rows={5} maxLength={4000} />
      </Field>
      <AgreementCheckbox id="c-agreement" />
      <ErrorNote message={state.message} errorRef={errorRef} />
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
  const [attempt, setAttempt] = useState(0);
  return (
    <QuoteFormAttempt
      key={attempt}
      startedAt={startedAt}
      onReset={() => setAttempt((value) => value + 1)}
    />
  );
}

function QuoteFormAttempt({ startedAt, onReset }: { startedAt: number; onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitQuoteAction, idleLeadState);

  if (state.status === "success") {
    return (
      <SuccessPanel
        message={state.message ?? "Request sent."}
        onReset={onReset}
        resetLabel="Submit another request"
      />
    );
  }

  return (
    <QuoteWizard
      action={formAction}
      pending={pending}
      message={state.message}
      guards={<GuardFields startedAt={startedAt} />}
      project={
        <fieldset className="flex flex-col gap-4" disabled={pending}>
          <legend className="text-sm font-semibold text-ink">1 · Project</legend>
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
          </div>
        </fieldset>
      }
      requirements={
        <fieldset className="flex flex-col gap-4" disabled={pending}>
          <legend className="text-sm font-semibold text-ink">2 · Requirements</legend>
          <Field
            label="Project requirements"
            htmlFor="q-requirements"
            required
            hint="Include the business problem, who will use it, key features and any integrations. You can use labelled paragraphs or a bullet list (20–8,000 characters)."
          >
            <Textarea
              id="q-requirements"
              name="requirements"
              required
              minLength={20}
              rows={8}
              maxLength={8000}
            />
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
      }
      contact={
        <fieldset className="flex flex-col gap-4" disabled={pending}>
          <legend className="text-sm font-semibold text-ink">3 · Contact</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="q-name" required>
              <Input
                id="q-name"
                name="fullName"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
              />
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
              <Input
                id="q-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                minLength={6}
                maxLength={20}
              />
            </Field>
            <Field label="WhatsApp (optional)" htmlFor="q-whatsapp">
              <Input id="q-whatsapp" name="whatsapp" type="tel" maxLength={20} />
            </Field>
            <Field label="Location / city (optional)" htmlFor="q-location">
              <Input id="q-location" name="location" maxLength={160} />
            </Field>
            <Field label="Preferred contact method" htmlFor="q-preferred">
              <Select id="q-preferred" name="preferredContact" defaultValue="email">
                <option value="email">Email</option>
                <option value="phone">Phone call</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </Field>
          </div>
        </fieldset>
      }
      consent={
        <fieldset className="flex flex-col gap-2" disabled={pending}>
          <legend className="text-sm font-semibold text-ink">4 · Consent</legend>
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
      }
    />
  );
}

export function AppointmentForm({ startedAt }: { startedAt: number }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <AppointmentFormAttempt
      key={attempt}
      startedAt={startedAt}
      onReset={() => setAttempt((value) => value + 1)}
    />
  );
}

function AppointmentFormAttempt({ startedAt, onReset }: { startedAt: number; onReset: () => void }) {
  const { state, formAction, pending, errorRef, formProps } = useLeadForm(requestAppointmentAction);
  const [dates] = useState(() => upcomingBookingDates());
  const [date, setDate] = useState(() => dates[0] ?? "");
  const [time, setTime] = useState("");
  const [taken, setTaken] = useState<ReadonlySet<string>>(() => new Set());

  // Load booked slots on mount and again after a failed attempt (e.g. a slot
  // taken moments earlier) so the grid never offers an already booked time.
  useEffect(() => {
    let active = true;
    getBookedSlotsAction()
      .then((keys) => {
        if (active) setTaken(new Set(keys));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [state]);

  const chooseDate = (value: string) => {
    setDate(value);
    if (time && taken.has(slotKey(value, slotLabel(time)))) setTime("");
  };
  const ready = Boolean(date && time) && !taken.has(slotKey(date, slotLabel(time)));

  if (state.status === "success") {
    return (
      <SuccessPanel
        message={state.message ?? "Request sent."}
        onReset={onReset}
        resetLabel="Request another slot"
      />
    );
  }

  return (
    <form action={formAction} {...formProps} className="flex flex-col gap-4">
      <GuardFields startedAt={startedAt} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="a-name" required>
          <Input id="a-name" name="name" autoComplete="name" required minLength={2} maxLength={120} />
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
          <Input id="a-phone" name="phone" type="tel" autoComplete="tel" minLength={6} maxLength={20} />
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
      <BookingSlotPicker
        dates={dates}
        taken={taken}
        date={date}
        time={time}
        disabled={pending}
        onDateChange={chooseDate}
        onTimeChange={setTime}
      />
      <p className={bookingStyles.summary} data-ready={ready || undefined} aria-live="polite">
        <CalendarCheck aria-hidden="true" size={18} />
        {ready
          ? `Your slot: ${describeDate(date).long} at ${slotLabel(time)} · 30 min`
          : "Pick a date and a time slot to continue."}
      </p>
      <ErrorNote message={state.message} errorRef={errorRef} />
      <div>
        <Button type="submit" loading={pending} disabled={!ready}>
          <CalendarCheck aria-hidden="true" className="h-4 w-4" />
          {pending ? "Booking…" : "Book appointment"}
        </Button>
      </div>
    </form>
  );
}
