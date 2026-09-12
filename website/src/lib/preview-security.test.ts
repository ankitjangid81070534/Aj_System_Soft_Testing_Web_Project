import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("preview embedding security", () => {
  it.each([
    { mode: "development", suffix: "sandbox.example.com", embedded: true },
    { mode: "development", suffix: "", embedded: false },
    { mode: "production", suffix: "sandbox.example.com", embedded: false },
    { mode: "production", suffix: "", embedded: false },
  ])("$mode with suffix '$suffix' allows embedding: $embedded", async ({ mode, suffix, embedded }) => {
    vi.stubEnv("NODE_ENV", mode);
    vi.stubEnv("BASE44_PUBLIC_HOST_SUFFIX", suffix);
    vi.resetModules();
    const { default: config } = await import("../../next.config");
    const routes = await config.headers!();
    const headers = routes.find((route) => route.source === "/:path*")!.headers;
    const csp = headers.find((header) => header.key === "Content-Security-Policy")!.value;
    expect(csp.includes("frame-ancestors 'none'")).toBe(!embedded);
    expect(headers.some((header) => header.key === "X-Frame-Options" && header.value === "DENY")).toBe(!embedded);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
    if (mode === "production") {
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).toContain("upgrade-insecure-requests");
    }
    if (suffix) expect(config.allowedDevOrigins).toContain(`3000-${suffix}`);
    // Only this development preview origin is trusted for forwarded actions.
    expect(config.experimental?.serverActions).toEqual(
      embedded ? { allowedOrigins: [`3000-${suffix}`] } : undefined,
    );
  });
});
