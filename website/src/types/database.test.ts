import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Regression guard: the hand-written Database type must satisfy supabase-js's
 * GenericTable contract (tables require a Relationships field). When it does
 * not, every query result silently resolves to `never` instead of failing
 * loudly. Building a query performs no network I/O, so these checks are safe.
 */
const client = createClient<Database>("https://example.supabase.co", "anon-key");

type IsNever<T> = [T] extends [never] ? true : false;

describe("Database type wiring", () => {
  it("profiles queries resolve to real row types, not never", () => {
    const query = client.from("profiles").select("id, email, role").limit(1);
    type Data = Awaited<typeof query>["data"];
    const isNever: IsNever<Data> = false;
    expect(isNever).toBe(false);
    expect(query).toBeDefined();
  });

  it("projects queries resolve to real row types, not never", () => {
    const query = client.from("projects").select("id, slug, is_public").limit(1);
    type Data = Awaited<typeof query>["data"];
    const isNever: IsNever<Data> = false;
    expect(isNever).toBe(false);
    expect(query).toBeDefined();
  });

  it("site_settings queries resolve to real row types, not never", () => {
    const query = client.from("site_settings").select("brand_name").limit(1);
    type Data = Awaited<typeof query>["data"];
    const isNever: IsNever<Data> = false;
    expect(isNever).toBe(false);
    expect(query).toBeDefined();
  });
});
