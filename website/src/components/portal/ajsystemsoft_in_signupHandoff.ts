"use client";

/**
 * One-time, in-memory hand-off of sign-up credentials to the sign-in form.
 * Never written to storage, cookies or the URL: it lives only in this tab's JS
 * memory, survives the client-side route change, and is cleared on first read.
 */
type Credentials = { email: string; password: string };

let pending: Credentials | null = null;

export function setSignupHandoff(credentials: Credentials) {
  pending = credentials;
}

export function peekSignupHandoff(): Credentials | null {
  return pending;
}

export function clearSignupHandoff() {
  pending = null;
}
