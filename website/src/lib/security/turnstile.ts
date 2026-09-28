import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Turnstile is enforced only when BOTH keys are configured. */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

/**
 * Verifies a Turnstile token server-side. Returns an error message for the
 * visitor, or null when the check passes (or Turnstile is not configured).
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<string | null> {
  if (!isTurnstileEnabled()) return null;
  if (!token) return "Please complete the security check and try again.";
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success ? null : "The security check failed. Please try again.";
  } catch (error) {
    console.error("[turnstile] verification unavailable:", error);
    return "The security check could not be verified. Please try again in a moment.";
  }
}
