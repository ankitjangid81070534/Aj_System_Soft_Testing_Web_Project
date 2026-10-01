import { notFound } from "next/navigation";
import { SentryTestButton } from "./ajsystemsoft_in_SentryTestButton";

// TEMPORARY Sentry verification page — delete this folder once verified.
export const metadata = { robots: { index: false, follow: false } };

export default function SentryTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main style={{ padding: 48 }}>
      <h1>Sentry test</h1>
      <p>Click the button, then check your Sentry Issues page.</p>
      <SentryTestButton />
    </main>
  );
}
