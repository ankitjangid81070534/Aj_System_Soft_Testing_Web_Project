"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/lib/auth/actions";
import { Lock, User, KeyRound, Loader2, ArrowRight } from "lucide-react";

const initialState: SignInState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="identifier"
          className="text-xs font-semibold uppercase tracking-wider text-ink-soft"
        >
          Username
        </label>
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted"
          >
            <User className="h-4 w-4" />
          </div>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="e.g. ankit.admin"
            required
            autoFocus
            className="w-full rounded-xl border border-line bg-canvas pl-9 pr-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-wider text-ink-soft"
        >
          Password
        </label>
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted"
          >
            <KeyRound className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full rounded-xl border border-line bg-canvas pl-9 pr-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {state.error ? (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-xs font-medium text-danger"
        >
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-on-brand shadow-e1 transition-all hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60 focus-ring"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying credentials…</span>
          </>
        ) : (
          <>
            <span>Sign in to Admin</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
