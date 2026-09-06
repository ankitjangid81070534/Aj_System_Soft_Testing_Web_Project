"use client";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Something went wrong</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-ink-muted">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-700"
      >
        Try again
      </button>
    </main>
  );
}
