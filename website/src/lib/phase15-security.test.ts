import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

async function loadHeaders(mode: "development" | "production", preview = "test.preview.invalid") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", mode);
  vi.stubEnv("BASE44_PUBLIC_HOST_SUFFIX", preview);
  const { default: config } = await import("../../next.config");
  const routes = await config.headers!();
  const headers = Object.fromEntries(routes.find(route => route.source === "/:path*")!.headers.map(header => [header.key, header.value]));
  return { config, routes, headers };
}

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("Phase 15 existing security boundary contracts", () => {
  it("retains production clickjacking, MIME, referrer, permissions and transport protection", async () => {
    const { headers } = await loadHeaders("production");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
    const csp = headers["Content-Security-Policy"];
    for (const directive of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "upgrade-insecure-requests"]) expect(csp).toContain(directive);
    expect(csp).not.toContain("'unsafe-eval'");
  });
  it("preserves Supabase, Google advertising and existing media CSP origins", async () => {
    const { config, headers } = await loadHeaders("production");
    const csp = headers["Content-Security-Policy"];
    for (const origin of ["https://*.supabase.co", "wss://*.supabase.co", "https://pagead2.googlesyndication.com", "https://*.doubleclick.net", "https://fundingchoicesmessages.google.com", "https://*.adtrafficquality.google", "https://strvid.nyc3.cdn.digitaloceanspaces.com"]) expect(csp).toContain(origin);
    expect(config.images?.remotePatterns).toContainEqual({ protocol: "https", hostname: "lh3.googleusercontent.com" });
  });
  it("limits the embedding exception to sandbox development and retains private noindex", async () => {
    const { config, headers, routes } = await loadHeaders("development");
    expect(headers["X-Frame-Options"]).toBeUndefined();
    expect(config.allowedDevOrigins).toEqual(["3000-test.preview.invalid"]);
    expect(config.experimental?.serverActions).toEqual({ allowedOrigins: ["3000-test.preview.invalid"] });
    for (const path of ["/ajadmin/:path*", "/account/:path*", "/auth/:path*", "/login", "/signup", "/forgot-password"]) {
      expect(routes.find(route => route.source === path)?.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
    const local = await loadHeaders("development", "");
    expect(local.headers["X-Frame-Options"]).toBe("DENY");
  });
  it("keeps service-role modules server-only and public environment separate", () => {
    for (const path of ["./env.server.ts", "./supabase/admin.ts"]) {
      expect(readFileSync(new URL(path, import.meta.url), "utf8")).toContain('import "server-only"');
    }
    expect(readFileSync(new URL("./env.ts", import.meta.url), "utf8")).not.toContain("process.env.SUPABASE_SERVICE_ROLE_KEY");
  });
});
