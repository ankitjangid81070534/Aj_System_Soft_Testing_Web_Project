import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ publicClient: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: true }));
vi.mock("@/lib/supabase/public", () => ({ createSupabasePublicClient: mocks.publicClient }));

import { getLiveAnnouncements, getLiveOffers } from "./growth";

// Unit fixtures only: no record here is written to a database.
const hourMs = 60 * 60 * 1000;
const future = () => new Date(Date.now() + hourMs).toISOString();
const past = () => new Date(Date.now() - hourMs).toISOString();

function listQuery(records: Record<string, unknown>[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: records, error: null }),
  };
}

function client(records: Record<string, unknown>[]) {
  mocks.publicClient.mockReturnValue({ from: vi.fn(() => listQuery(records)) });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("growth schedule windows", () => {
  it("hides offers that have not started and offers that already ended", async () => {
    client([
      { id: "1", title: "Live", slug: "live", start_at: past(), end_at: future() },
      { id: "2", title: "Upcoming", slug: "upcoming", start_at: future(), end_at: null },
      { id: "3", title: "Expired", slug: "expired", start_at: null, end_at: past() },
    ]);

    const offers = await getLiveOffers();

    expect(offers.map((offer) => offer.slug)).toEqual(["live"]);
  });

  it("hides announcements outside their schedule window", async () => {
    client([
      { id: "1", title: "Live", slug: "live-update", start_at: null, end_at: null },
      { id: "2", title: "Upcoming", slug: "upcoming-update", start_at: future(), end_at: null },
      { id: "3", title: "Expired", slug: "expired-update", start_at: null, end_at: past() },
    ]);

    const items = await getLiveAnnouncements();

    expect(items.map((item) => item.slug)).toEqual(["live-update"]);
  });
});
