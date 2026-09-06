"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Field, Input } from "@/components/ui/Input";

export function LoginPasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <Field label="Password" htmlFor="client-password" required>
      <div className="relative">
        <KeyRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted" />
        <Input id="client-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required minLength={8} className="pl-10 pr-12" />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls="client-password" onClick={() => setVisible(value => !value)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-lg text-ink-muted hover:text-ink focus-ring">
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
    </Field>
  );
}
