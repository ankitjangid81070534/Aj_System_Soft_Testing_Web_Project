import * as Sentry from "@sentry/nextjs";

/**
 * Server/edge error monitoring. Sentry only starts when SENTRY_DSN (or
 * NEXT_PUBLIC_SENTRY_DSN) is set, so the app runs unchanged without it.
 */
export function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
