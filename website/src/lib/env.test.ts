import { describe, expect, it } from "vitest";
import { parsePublicSupabaseEnv, parseSiteUrl } from "@/lib/env";

describe("parseSiteUrl", () => {
  it("falls back to localhost when unset", () => {
    expect(parseSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(parseSiteUrl("")).toBe("http://localhost:3000");
  });

  it("falls back to localhost for placeholder values from .env.example", () => {
    expect(parseSiteUrl("REPLACE_WITH_YOUR_PRODUCTION_URL")).toBe("http://localhost:3000");
  });

  it("strips trailing slashes", () => {
    expect(parseSiteUrl("https://example.com/")).toBe("https://example.com");
  });

  it("rejects invalid URLs", () => {
    expect(() => parseSiteUrl("not-a-url")).toThrow(/Invalid NEXT_PUBLIC_SITE_URL/);
  });
});

describe("parsePublicSupabaseEnv", () => {
  const complete = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  };

  it("returns null when nothing is configured", () => {
    expect(parsePublicSupabaseEnv({})).toBeNull();
  });

  it("returns null when both values are placeholders from .env.example", () => {
    expect(
      parsePublicSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://REPLACE_WITH_YOUR_PROJECT.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "REPLACE_WITH_YOUR_SUPABASE_ANON_KEY",
      }),
    ).toBeNull();
  });

  it("throws on partial configuration", () => {
    expect(() =>
      parsePublicSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }),
    ).toThrow(/partially configured/);
  });

  it("throws on an invalid URL", () => {
    expect(() =>
      parsePublicSupabaseEnv({ ...complete, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }),
    ).toThrow(/Invalid NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("parses a complete configuration", () => {
    expect(parsePublicSupabaseEnv(complete)).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });
});
