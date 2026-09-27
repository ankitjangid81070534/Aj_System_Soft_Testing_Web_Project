"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  confirmAdminResetAction,
  requestAdminResetAction,
  type AdminResetState,
} from "@/lib/auth/admin-reset-actions";

const input =
  "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20";
const label = "text-xs font-semibold uppercase tracking-wider text-ink-soft";
const submit =
  "mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-on-brand shadow-e1 transition-all hover:bg-brand-700 disabled:opacity-60 focus-ring";

function Notice({ state }: { state: AdminResetState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-xs text-danger">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="rounded-xl bg-success-soft px-3.5 py-2.5 text-xs text-success">
        {state.message}
      </p>
    );
  return null;
}

export function AdminResetForm() {
  const [requested, request, requesting] = useActionState(requestAdminResetAction, {
    step: "request",
  } as AdminResetState);
  const [confirmed, confirm, confirming] = useActionState(confirmAdminResetAction, {
    step: "verify",
  } as AdminResetState);

  const done = confirmed.step === "done";
  // A failed verify that needs a fresh code sends the user back to step 1.
  const showVerify = requested.step === "verify" && confirmed.step !== "request";
  const active = !showVerify && confirmed.step === "request" ? confirmed : requested;

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <Notice state={confirmed} />
        <Link href="/ajadmin/login" className={submit}>
          Back to sign in
        </Link>
      </div>
    );
  }

  if (!showVerify) {
    return (
      <form action={request} className="flex flex-col gap-4">
        <Notice state={active} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-identifier" className={label}>
            Username or email
          </label>
          <input
            id="reset-identifier"
            name="identifier"
            autoComplete="username"
            required
            autoFocus
            className={input}
          />
        </div>
        <button type="submit" disabled={requesting} className={submit}>
          {requesting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send code to my email
        </button>
      </form>
    );
  }

  return (
    <form action={confirm} className="flex flex-col gap-4">
      <Notice state={confirmed.error ? confirmed : requested} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-code" className={label}>
          6-digit code
        </label>
        <input
          id="reset-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          className={`${input} tracking-[0.4em]`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-password" className={label}>
          New password
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={input}
        />
        <p className="text-[11px] text-ink-muted">
          12+ characters with upper and lower case letters, a number and a symbol.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-confirm" className={label}>
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={input}
        />
      </div>
      <button type="submit" disabled={confirming} className={submit}>
        {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
        Set new password
      </button>
    </form>
  );
}
