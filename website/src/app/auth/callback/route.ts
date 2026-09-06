import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { requirePublicSupabaseEnv } from "@/lib/env";
import { safePortalPath } from "@/lib/validation/portal";
import { RECOVERY_COOKIE_NAME, RECOVERY_COOKIE_OPTIONS } from "@/lib/auth/recovery";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const flow = url.searchParams.get("flow");
  const allowedTypes = new Set<EmailOtpType>([
    "email",
    "email_change",
    "invite",
    "magiclink",
    "recovery",
    "signup",
  ]);
  const type =
    rawType && allowedTypes.has(rawType as EmailOtpType) ? (rawType as EmailOtpType) : null;
  const nextPath = safePortalPath(
    url.searchParams.get("next") ?? (type === "recovery" ? "/update-password" : null),
  );
  const isRecovery =
    flow === "recovery" ||
    type === "recovery" ||
    nextPath === "/update-password" ||
    nextPath === "/reset-password";

  if (code || (tokenHash && type)) {
    const { url: supabaseUrl, anonKey } = requirePublicSupabaseEnv();
    const response = NextResponse.redirect(new URL(nextPath, url.origin));
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });
    if (!error) {
      if (isRecovery) {
        response.cookies.set(RECOVERY_COOKIE_NAME, "1", RECOVERY_COOKIE_OPTIONS);
      }
      return response;
    }

    console.error("[portal-auth] OAuth code exchange failed", {
      code: error.code,
      status: error.status,
    });
  }

  const errorUrl = new URL(isRecovery ? "/update-password" : "/login", url.origin);
  errorUrl.searchParams.set("error", isRecovery ? "invalid_recovery_link" : "oauth_callback");
  return NextResponse.redirect(errorUrl);
}
