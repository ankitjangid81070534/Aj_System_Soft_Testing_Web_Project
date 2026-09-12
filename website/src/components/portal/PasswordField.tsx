"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Field, Input, type InputProps } from "@/components/ui/Input";

/** One accessible visibility control; validation and values stay with the form. */
export function PasswordField({
  label,
  hint,
  leadingIcon = false,
  ...props
}: Omit<InputProps, "type" | "className"> & {
  id: string;
  label: string;
  hint?: string;
  leadingIcon?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${props.id}-hint` : undefined;
  return (
    <Field label={label} htmlFor={props.id} required={props.required}>
      <div className="relative min-w-0">
        {leadingIcon ? (
          <KeyRound
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted"
          />
        ) : null}
        <Input
          {...props}
          type={visible ? "text" : "password"}
          aria-describedby={
            [props["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined
          }
          className={leadingIcon ? "pl-10 pr-12" : "pr-12"}
        />
        <button
          type="button"
          disabled={props.disabled}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={props.id}
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-field text-ink-muted hover:text-ink focus-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-ink-muted">
          {hint}
        </p>
      ) : null}
    </Field>
  );
}
