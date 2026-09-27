import "server-only";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";

export type AnalyticsReport = {
  views: number;
  visitors: number;
  sessions: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
};

export const RANGES = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  custom: "Custom dates",
} as const;
export type RangeKey = keyof typeof RANGES;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date in IST as YYYY-MM-DD. */
export function istToday(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function istMidnight(day: string): Date {
  return new Date(Date.parse(`${day}T00:00:00Z`) - IST_OFFSET_MS);
}

function shift(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Resolve a range to inclusive IST days [fromDay, toDay]. */
export function resolveRange(range: string | undefined, from?: string, to?: string) {
  const today = istToday();
  const key: RangeKey = range && range in RANGES ? (range as RangeKey) : "30d";
  let fromDay = today;
  let toDay = today;
  if (key === "yesterday") fromDay = toDay = shift(today, -1);
  else if (key === "7d") fromDay = shift(today, -6);
  else if (key === "30d") fromDay = shift(today, -29);
  else if (key === "90d") fromDay = shift(today, -89);
  else if (key === "12m") fromDay = shift(today, -364);
  else if (key === "custom" && from && DATE_RE.test(from)) {
    fromDay = from;
    toDay = to && DATE_RE.test(to) && to >= from ? to : today;
    if (toDay > today) toDay = today;
  }
  return { key, fromDay, toDay };
}

export async function getAnalyticsReport(fromDay: string, toDay: string) {
  const { data, error } = await createSupabaseAdminLooseClient().rpc("analytics_report", {
    p_from: istMidnight(fromDay).toISOString(),
    p_to: istMidnight(shift(toDay, 1)).toISOString(),
  });
  if (error) return { report: null, error };
  return { report: data as AnalyticsReport, error: null };
}

/** Every day in the range (so empty days show as 0). */
export function fillDays(report: AnalyticsReport, fromDay: string, toDay: string) {
  const byDay = new Map(report.daily.map((d) => [d.day, d]));
  const out: { day: string; views: number; visitors: number }[] = [];
  for (let day = fromDay; day <= toDay; day = shift(day, 1)) {
    out.push(byDay.get(day) ?? { day, views: 0, visitors: 0 });
  }
  return out;
}

/** Group days into months when a range is long (e.g. 12 months). */
export function groupMonths(days: { day: string; views: number; visitors: number }[]) {
  const map = new Map<string, { day: string; views: number; visitors: number }>();
  for (const d of days) {
    const key = d.day.slice(0, 7);
    const m = map.get(key) ?? { day: key, views: 0, visitors: 0 };
    m.views += d.views;
    m.visitors += d.visitors; // sum of daily uniques
    map.set(key, m);
  }
  return [...map.values()];
}
