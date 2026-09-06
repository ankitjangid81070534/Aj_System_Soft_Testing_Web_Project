import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { requirePublicSupabaseEnv } from "@/lib/env";
import { safePortalPath } from "@/lib/validation/portal";
import { RECOVERY_COOKIE_NAME, RECOVERY_COOKIE_OPTIONS } from "@/lib/auth/recovery";

const EMAIL_TYPES = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

/**
 * Token-hash email confirmation works across browsers/devices because it does
 * not depend on the PKCE verifier cookie created where the email was requested.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const type =
    rawType && EMAIL_TYPES.has(rawType as EmailOtpType) ? (rawType as EmailOtpType) : null;
  const nextPath = safePortalPath(
    url.searchParams.get("next") ?? (type === "recovery" ? "/update-password" : "/account"),
  );
  const destination = NextResponse.redirect(new URL(nextPath, url.origin));

  if (tokenHash && type) {
    const { url: supabaseUrl, anonKey } = requirePublicSupabaseEnv();
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            destination.cookies.set(name, value, options);
          }
        },
      },
    });
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (type === "recovery") {
        destination.cookies.set(RECOVERY_COOKIE_NAME, "1", RECOVERY_COOKIE_OPTIONS);
      }
      return destination;
    }
    console.error("[portal-auth] email token verification failed", {
      code: error.code,
      status: error.status,
      type,
    });
  }

  const errorUrl = new URL(type === "recovery" ? "/update-password" : "/login", url.origin);
  errorUrl.searchParams.set(
    "error",
    type === "recovery" ? "invalid_recovery_link" : "invalid_email_link",
  );
  return NextResponse.redirect(errorUrl);
}
