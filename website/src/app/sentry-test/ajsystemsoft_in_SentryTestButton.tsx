"use client";

// TEMPORARY: throws in an event handler so Sentry's global handler reports it.
export function SentryTestButton() {
  return (
    <button
      type="button"
      onClick={() => {
        throw new Error("Sentry test error (temporary test button)");
      }}
      style={{ padding: "12px 20px", fontSize: 16, cursor: "pointer" }}
    >
      Trigger test error
    </button>
  );
}
