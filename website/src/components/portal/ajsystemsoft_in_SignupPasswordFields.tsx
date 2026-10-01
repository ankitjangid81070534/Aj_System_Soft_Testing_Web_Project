"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { PasswordField } from "./PasswordField";

const RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Number", test: (v: string) => /\d/.test(v) },
  { label: "Symbol (!@#$…)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const LEVELS = [
  { label: "Too weak", color: "bg-red-500", text: "text-red-600" },
  { label: "Weak", color: "bg-red-500", text: "text-red-600" },
  { label: "Fair", color: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-700" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" },
];

/** 0 = empty, 1 weak … 4 strong (12+ chars with every rule). */
function score(value: string) {
  if (!value) return 0;
  const passed = RULES.filter((r) => r.test(value)).length;
  if (value.length < 8) return 1;
  if (value.length >= 12 && passed === RULES.length) return 4;
  return Math.min(3, Math.max(1, passed - 1));
}

/** Signup password + confirm with a live strength meter (UI guidance only). */
export function SignupPasswordFields() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const level = score(password);
  const meta = LEVELS[level];
  const matches = confirm === password;

  return (
    <div className="grid gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          label="Password"
          id="signup-password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          aria-describedby="signup-password-strength"
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm password"
          id="signup-confirm"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <div
        id="signup-password-strength"
        aria-live="polite"
        className="rounded-xl border border-line bg-canvas-raised/60 p-3 text-xs"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-ink">Password strength</span>
          <span className={`font-semibold ${password ? meta.text : "text-ink-muted"}`}>
            {password ? meta.label : "Start typing"}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                password && level >= i ? meta.color : "bg-line"
              }`}
            />
          ))}
        </div>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
          {RULES.map((rule) => {
            const ok = rule.test(password);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-ink-muted"}`}
              >
                {ok ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <X aria-hidden="true" className="h-3.5 w-3.5 opacity-60" />
                )}
                {rule.label}
              </li>
            );
          })}
          {confirm ? (
            <li
              className={`flex items-center gap-1.5 font-medium ${
                matches ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {matches ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {matches ? "Passwords match" : "Passwords don't match"}
            </li>
          ) : null}
        </ul>
        <p className="mt-2 text-ink-muted">Tip: 12+ characters mixing all of the above is strongest.</p>
      </div>
    </div>
  );
}
