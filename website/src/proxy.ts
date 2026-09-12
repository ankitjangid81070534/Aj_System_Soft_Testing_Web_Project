import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabasePublicEnv } from "@/lib/env";

const ADMIN_ROOT = "/ajadmin";
const LOGIN_PATH = `${ADMIN_ROOT}/login`;
const CLIENT_ROOTS = ["/account", "/portal", "/profile"];

// ---------------------------------------------------------------------------
// Slugged-content redirects (SEO Manager). Cached at the edge for 5 minutes —
// soft, never-blocking: on any failure the request simply continues.
// ---------------------------------------------------------------------------
type RedirectMap = Map<string, string>;
const redirectCache: { map: RedirectMap; fetchedAt: number } = { map: new Map(), fetchedAt: 0 };
const REDIRECT_TTL_MS = 5 * 60 * 1000;

async function getRedirects(): Promise<RedirectMap> {
  if (!isSupabaseConfigured || !supabasePublicEnv) return redirectCache.map;
  const now = Date.now();
  if (now - redirectCache.fetchedAt < REDIRECT_TTL_MS) return redirectCache.map;
  try {
    const url = `${supabasePublicEnv.url}/rest/v1/redirects?select=from_path,to_path&is_active=eq.true`;
    const response = await fetch(url, {
      headers: {
        apikey: supabasePublicEnv.anonKey,
        Authorization: `Bearer ${supabasePublicEnv.anonKey}`,
      },
      signal: AbortSignal.timeout(2000),
    });
    if (response.ok) {
      const rows = (await response.json()) as { from_path: string; to_path: string }[];
      const map: RedirectMap = new Map(rows.map((row) => [row.from_path, row.to_path]));
      redirectCache.map = map;
      redirectCache.fetchedAt = now;
    }
  } catch {
    // soft failure — continue without redirects
  }
  return redirectCache.map;
}

/**
 * Auth gate for the admin application. The middleware redirect is a UX layer —
 * real authorization is enforced by Supabase RLS and server-side role checks.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Some older Supabase recovery templates returned the PKCE code to the
  // site root. Recover that flow without exposing or logging the code.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const recoveryUrl = request.nextUrl.clone();
    recoveryUrl.pathname = "/auth/callback";
    recoveryUrl.searchParams.set("next", "/update-password");
    recoveryUrl.searchParams.set("flow", "recovery");
    return NextResponse.redirect(recoveryUrl, 307);
  }
  const isAdminPath = pathname.startsWith(ADMIN_ROOT);
  const isAdminLogin = pathname.startsWith(LOGIN_PATH);
  const isClientPath = CLIENT_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );

  // Changed-slug redirects (SEO Manager): permanent redirect, query preserved.
  const redirects = await getRedirects();
  const target = redirects.get(pathname);
  if (target) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = target;
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Slugged public content needs the redirect map, not an Auth round trip.
  // Keep existing account/admin/login session refresh behavior unchanged.
  if (["/services", "/projects", "/blog"].some(
    root => pathname === root || pathname.startsWith(`${root}/`),
  )) return NextResponse.next();

  // Public fallback pages intentionally work without Supabase. Only warn on
  // protected routes where the missing configuration affects authentication.
  // Preserve scaffold access here; server-side authorization remains unchanged.
  if (!isSupabaseConfigured || !supabasePublicEnv) {
    if (isAdminPath || isClientPath) {
      console.warn("[auth] Supabase not configured — session checks unavailable for this protected route.");
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabasePublicEnv.url, supabasePublicEnv.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isAdminPath && !isAdminLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (!user && isClientPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/portal/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/update-password",
    "/",
    "/ajadmin/:path*",
    "/services/:path*",
    "/projects/:path*",
    "/blog/:path*",
  ],
};
