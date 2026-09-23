"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { verifyTwoFactorAction, type TwoFactorState } from "@/lib/security/two-factor-actions";

const initialState: TwoFactorState = { status: "idle" };

export function TwoFactorChallenge() {
  const [state, action, pending] = useActionState(verifyTwoFactorAction, initialState);

  return (
    <form action={action} aria-busy={pending} className="flex flex-col gap-4">
      <Field label="Authentication code" htmlFor="admin-2fa-code" required>
        <Input
          id="admin-2fa-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          autoFocus
          required
        />
      </Field>
      {state.status === "error" ? (
        <p role="alert" className="text-xs text-danger">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        )}
        Verify and continue
      </Button>
    </form>
  );
}
