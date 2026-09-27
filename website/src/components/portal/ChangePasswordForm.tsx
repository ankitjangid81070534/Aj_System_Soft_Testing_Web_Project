"use client";

import { useActionState, useState } from "react";
import { KeyRound, Mail, Send } from "lucide-react";
import {
  changePasswordWithCurrentAction,
  changePasswordWithOtpAction,
  sendPasswordOtpAction,
} from "@/lib/portal/password-actions";
import type { PortalActionState } from "@/lib/portal/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { PortalFeedback } from "./PortalFeedback";
import styles from "./portal-ui.module.css";

const idle: PortalActionState = { status: "idle" };

function NewPasswordFields({ prefix }: { prefix: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="New password" htmlFor={`${prefix}-new`} hint="8+ characters, a letter and a number" required>
        <Input id={`${prefix}-new`} name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
      </Field>
      <Field label="Confirm new password" htmlFor={`${prefix}-confirm`} required>
        <Input id={`${prefix}-confirm`} name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
      </Field>
    </div>
  );
}

function WithCurrentPassword() {
  const [state, action, pending] = useActionState(changePasswordWithCurrentAction, idle);
  return (
    <form key={state.status === "success" ? "done" : "form"} action={action} aria-busy={pending} className={`${styles.form} space-y-4`}>
      <Field label="Current password" htmlFor="pw-current" required>
        <Input id="pw-current" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required />
      </Field>
      <NewPasswordFields prefix="pw-cur" />
      <PortalFeedback state={state} focusOnError />
      <Button type="submit" size="sm" loading={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}

function WithEmailCode() {
  const [sent, send, sending] = useActionState(sendPasswordOtpAction, idle);
  const [state, action, pending] = useActionState(changePasswordWithOtpAction, idle);
  const codeSent = sent.status === "success";

  return (
    <div className="space-y-4">
      <form action={send} aria-busy={sending} className="space-y-3">
        <p className="text-sm text-ink-muted">
          We&apos;ll email a 6-digit code to your account address. Works for Google sign-in accounts too.
        </p>
        <PortalFeedback state={sent} />
        <Button type="submit" size="sm" variant={codeSent ? "secondary" : "primary"} loading={sending}>
          <Send aria-hidden="true" className="h-4 w-4" />
          {codeSent ? "Resend code" : "Send code to my email"}
        </Button>
      </form>
      {codeSent && state.status !== "success" ? (
        <form action={action} aria-busy={pending} className={`${styles.form} space-y-4 border-t border-line pt-4`}>
          <Field label="6-digit code" htmlFor="pw-code" required>
            <Input id="pw-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required />
          </Field>
          <NewPasswordFields prefix="pw-otp" />
          <PortalFeedback state={state} focusOnError />
          <Button type="submit" size="sm" loading={pending}>
            {pending ? "Updating…" : "Set new password"}
          </Button>
        </form>
      ) : null}
      {state.status === "success" ? <PortalFeedback state={state} /> : null}
    </div>
  );
}

/** Signed-in password change: current password OR an emailed one-time code. */
export function ChangePasswordForm() {
  const [mode, setMode] = useState<"current" | "otp">("current");
  const tab = (active: boolean) =>
    `inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-ring ${
      active ? "bg-surface text-ink shadow-e1" : "text-ink-muted hover:text-ink"
    }`;
  return (
    <div className="space-y-5">
      <div role="group" aria-label="How to change your password" className="flex gap-1 rounded-2xl bg-canvas p-1">
        <button type="button" aria-pressed={mode === "current"} onClick={() => setMode("current")} className={tab(mode === "current")}>
          <KeyRound aria-hidden="true" className="h-3.5 w-3.5" /> Current password
        </button>
        <button type="button" aria-pressed={mode === "otp"} onClick={() => setMode("otp")} className={tab(mode === "otp")}>
          <Mail aria-hidden="true" className="h-3.5 w-3.5" /> Email code
        </button>
      </div>
      {mode === "current" ? <WithCurrentPassword /> : <WithEmailCode />}
    </div>
  );
}
