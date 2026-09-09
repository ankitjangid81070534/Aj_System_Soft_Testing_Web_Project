"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, UserRound } from "lucide-react";
import {
  clientLoginAction,
  clientSignupAction,
  forgotPasswordAction,
  googleOAuthReadyAction,
  updatePasswordAction,
  type PortalActionState,
} from "@/lib/portal/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { siteUrl } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { LoginPasswordField } from "./LoginPasswordField";
import { AgreementCheckbox } from "@/components/site/LeadForms";

const initialState: PortalActionState = { status: "idle" };

/** Shared postal-address fields (sign-up + complete-your-profile). */
export function AddressFields({
  prefix,
  defaults,
}: {
  prefix: string;
  defaults?: Partial<Record<"addressLine1" | "addressLine2" | "city" | "state" | "postalCode" | "country", string>>;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-ink">Address</legend>
      <Field label="Address line" htmlFor={`${prefix}-address1`} required>
        <Input
          id={`${prefix}-address1`}
          name="addressLine1"
          autoComplete="address-line1"
          required
          minLength={3}
          maxLength={200}
          defaultValue={defaults?.addressLine1 ?? ""}
        />
      </Field>
      <Field label="Address line 2 (optional)" htmlFor={`${prefix}-address2`}>
        <Input
          id={`${prefix}-address2`}
          name="addressLine2"
          autoComplete="address-line2"
          maxLength={200}
          defaultValue={defaults?.addressLine2 ?? ""}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor={`${prefix}-city`} required>
          <Input
            id={`${prefix}-city`}
            name="city"
            autoComplete="address-level2"
            required
            maxLength={80}
            defaultValue={defaults?.city ?? ""}
          />
        </Field>
        <Field label="State" htmlFor={`${prefix}-state`} required>
          <Input
            id={`${prefix}-state`}
            name="state"
            autoComplete="address-level1"
            required
            maxLength={80}
            defaultValue={defaults?.state ?? ""}
          />
        </Field>
        <Field label="PIN / Postal code" htmlFor={`${prefix}-postal`} required>
          <Input
            id={`${prefix}-postal`}
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            required
            minLength={4}
            maxLength={12}
            defaultValue={defaults?.postalCode ?? ""}
          />
        </Field>
        <Field label="Country" htmlFor={`${prefix}-country`} required>
          <Input
            id={`${prefix}-country`}
            name="country"
            autoComplete="country-name"
            required
            maxLength={80}
            defaultValue={defaults?.country ?? "India"}
          />
        </Field>
      </div>
    </fieldset>
  );
}

function Feedback({ state }: { state: PortalActionState }) {
  if (!state.message) return null;
  return (
    <div
      role={state.status === "error" ? "alert" : "status"}
      className={
        state.status === "error"
          ? "rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          : "flex items-start gap-2 rounded-2xl border border-success/20 bg-success-soft px-4 py-3 text-sm text-success"
      }
    >
      {state.status === "success" ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      ) : null}
      <span>{state.message}</span>
    </div>
  );
}

function SubmitButton({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? busy : idle}
      {!pending ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}
    </Button>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startGoogleOAuth() {
    setPending(true);
    setError(null);
    const readiness = await googleOAuthReadyAction();
    if (readiness.status !== "success") {
      setError(readiness.message ?? "Google sign-in is unavailable right now.");
      setPending(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const callbackOrigin =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? window.location.origin
          : siteUrl;
      const redirectTo = `${callbackOrigin}/auth/callback?next=${encodeURIComponent("/account")}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { access_type: "offline", prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
    } catch (cause) {
      // Console gets the exact Supabase error for diagnosis; the UI shows a
      // safe, actionable message. In practice this is almost always a
      // dashboard configuration gap: the Google provider is disabled or the
      // callback URL is not in the Auth allowlist.
      console.error("[auth] Google OAuth failed to start:", cause);
      const message = String((cause as { message?: string } | null)?.message ?? "");
      if (/provider/i.test(message)) {
        setError("Google sign-in is not enabled for this site yet. The site owner must enable the Google provider in Supabase Auth settings.");
      } else if (/redirect|url/i.test(message)) {
        setError("The Google sign-in callback URL is not allowlisted yet. The site owner must add it under Supabase Auth URL configuration.");
      } else {
        setError("Google sign-in could not be started. Please try again.");
      }
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startGoogleOAuth}
        disabled={pending}
        className="action-control action-secondary flex h-11 w-full items-center justify-center gap-3 rounded-full border border-line bg-surface text-sm font-medium text-ink shadow-e1 transition-all hover:border-line-strong hover:shadow-e2 focus-ring disabled:opacity-60"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA4335] text-xs font-bold text-white">
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "G"}
        </span>
        {pending ? "Connecting…" : label}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Divider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div data-login-divider className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function ClientLoginForm({
  nextPath,
  error,
  notice,
}: {
  nextPath: string;
  error?: string;
  notice?: string;
}) {
  const [state, action, pending] = useActionState(clientLoginAction, initialState);

  return (
    <div className="space-y-5" data-client-login>
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Email address" htmlFor="client-email" required>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted"
            />
            <Input
              id="client-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              className="pl-10"
            />
          </div>
        </Field>
        <LoginPasswordField />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="rounded-sm text-xs font-medium text-brand-700 hover:text-brand-800 focus-ring"
          >
            Forgot password?
          </Link>
        </div>
        {notice ? <Feedback state={{ status: "success", message: notice }} /> : null}
        {error ? <Feedback state={{ status: "error", message: error }} /> : null}
        <Feedback state={state} />
        <SubmitButton pending={pending} idle="Sign in to client portal" busy="Signing in…" />
      </form>
      <Divider label="or" />
      <GoogleButton label="Continue with Google" />
      <p className="text-center text-sm text-ink-muted">
        New here?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-700 hover:text-brand-800 focus-ring rounded-sm"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function ClientSignupForm() {
  const [state, action, pending] = useActionState(clientSignupAction, initialState);

  return (
    <div className="space-y-5">
      <GoogleButton label="Sign up with Google" />
      <Divider />
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="signup-name" required>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted"
              />
              <Input
                id="signup-name"
                name="fullName"
                autoComplete="name"
                required
                maxLength={120}
                className="pl-10"
              />
            </div>
          </Field>
          <Field
            label="Username"
            htmlFor="signup-username"
            required
            hint="3–30 characters: letters, numbers, dots, dashes."
          >
            <Input
              id="signup-username"
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
              autoCapitalize="none"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address" htmlFor="signup-email" required>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
            />
          </Field>
          <Field label="Mobile number" htmlFor="signup-phone" required>
            <Input
              id="signup-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              minLength={8}
              maxLength={20}
            />
          </Field>
        </div>
        <Field label="Company (optional)" htmlFor="signup-company">
          <Input id="signup-company" name="company" autoComplete="organization" maxLength={160} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Password"
            htmlFor="signup-password"
            required
            hint="8+ characters with a letter and number."
          >
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
            />
          </Field>
          <Field label="Confirm password" htmlFor="signup-confirm" required>
            <Input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
            />
          </Field>
        </div>
        <AddressFields prefix="signup" />
        <label className="flex items-start gap-2.5 text-xs leading-5 text-ink-muted">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 accent-brand-600"
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy" className="font-medium text-brand-700 hover:underline">
              privacy policy
            </Link>{" "}
            and to AJS using these details to operate my account and respond to project requests.
          </span>
        </label>
        <AgreementCheckbox id="signup-agreement" className="text-xs leading-5" />
        <Feedback state={state} />
        <SubmitButton pending={pending} idle="Create secure account" busy="Creating account…" />
      </form>
      <p className="text-center text-sm text-ink-muted">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:text-brand-800 focus-ring rounded-sm"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);
  return (
    <form action={action} className="space-y-5">
      <Field label="Account email" htmlFor="recovery-email" required>
        <Input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
        />
      </Field>
      <Feedback state={state} />
      <SubmitButton pending={pending} idle="Send recovery link" busy="Sending…" />
      <p className="text-center text-sm text-ink-muted">
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:text-brand-800 focus-ring rounded-sm"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({
  initialError,
  recoveryReady,
}: {
  initialError?: string;
  recoveryReady: boolean;
}) {
  const [state, action, pending] = useActionState(updatePasswordAction, initialState);
  const [linkError, setLinkError] = useState<string | undefined>(initialError);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (!accessToken || !refreshToken || hash.get("type") !== "recovery") return;

    let active = true;
    createSupabaseBrowserClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (!active) return;
        if (error) {
          setLinkError("This recovery link is invalid or expired. Request a fresh link.");
          return;
        }
        window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
        setLinkError(undefined);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <form action={action} className="space-y-5">
      <Field
        label="New password"
        htmlFor="reset-password"
        required
        hint="8+ characters with a letter and number."
      >
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required={recoveryReady}
          disabled={!recoveryReady}
          minLength={8}
          autoFocus
        />
      </Field>
      <Field label="Confirm new password" htmlFor="reset-confirm" required>
        <Input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required={recoveryReady}
          disabled={!recoveryReady}
          minLength={8}
        />
      </Field>
      {linkError ? <Feedback state={{ status: "error", message: linkError }} /> : null}
      <Feedback state={state} />
      {recoveryReady ? (
        <SubmitButton pending={pending} idle="Update password" busy="Updating…" />
      ) : null}
      {state.status === "success" ? (
        <Button href="/login" variant="secondary" className="w-full">
          Continue to sign in
        </Button>
      ) : null}
      {linkError ? (
        <Button href="/forgot-password" variant="secondary" className="w-full">
          Request a new recovery link
        </Button>
      ) : null}
    </form>
  );
}
