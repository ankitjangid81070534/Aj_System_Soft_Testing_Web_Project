import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import {
  RANGES,
  fillDays,
  getAnalyticsReport,
  groupMonths,
  istToday,
  resolveRange,
} from "@/lib/analytics/report";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Website analytics" },
  robots: { index: false, follow: false },
};

const card = "rounded-2xl border border-line bg-surface p-5 shadow-e1";
const nf = new Intl.NumberFormat("en-IN");

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mt-4 max-w-2xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning">
      {children}
    </p>
  );
}

function Bars({ rows, total }: { rows: { label: string; value: number; sub?: string }[]; total: number }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-ink-muted">No data in this period.</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-medium text-ink" title={r.label}>{r.label}</span>
            <span className="shrink-0 tabular-nums text-ink-muted">
              {nf.format(r.value)}
              {r.sub ? ` · ${r.sub}` : ""}
              {total ? ` · ${Math.round((r.value / total) * 100)}%` : ""}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");

  const header = (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Website analytics</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Real visitors only — bots, crawlers, admin staff and repeat reloads are not counted. Dates are in IST.
      </p>
    </>
  );

  if (!can(user.role, "audit:read")) {
    return <section>{header}<Notice>Your role ({user.role}) cannot view analytics. Admins and super admins only.</Notice></section>;
  }
  if (!isSupabaseConfigured) {
    return <section>{header}<Notice>Supabase is not configured yet.</Notice></section>;
  }

  const query = await searchParams;
  const { key, fromDay, toDay } = resolveRange(query.range, query.from, query.to);
  const { report, error } = await getAnalyticsReport(fromDay, toDay);

  const filters = (
    <div className="mt-5 flex flex-wrap items-end gap-2">
      {(Object.keys(RANGES) as (keyof typeof RANGES)[]).filter((k) => k !== "custom").map((k) => (
        <Link
          key={k}
          href={`/ajadmin/analytics?range=${k}`}
          aria-current={k === key ? "page" : undefined}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium focus-ring ${
            k === key ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-ink hover:bg-canvas"
          }`}
        >
          {RANGES[k]}
        </Link>
      ))}
      <form action="/ajadmin/analytics" className="ml-auto flex flex-wrap items-end gap-2">
        <input type="hidden" name="range" value="custom" />
        <label className="text-xs text-ink-muted">
          From
          <input type="date" name="from" defaultValue={fromDay} max={istToday()} required
            className="mt-1 block rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink" />
        </label>
        <label className="text-xs text-ink-muted">
          To
          <input type="date" name="to" defaultValue={toDay} max={istToday()} required
            className="mt-1 block rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink" />
        </label>
        <button type="submit" className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white focus-ring">
          Apply
        </button>
      </form>
    </div>
  );

  if (error || !report) {
    const missing = error && /analytics_report|page_views|PGRST202|PGRST205|42P01|42883/i.test(`${error.code} ${error.message}`);
    return (
      <section>
        {header}
        {filters}
        <Notice>
          {missing
            ? "Analytics storage is not set up yet. Run migration 0022_site_analytics.sql in the Supabase SQL editor, then reload this page."
            : "Could not load analytics right now. Please try again."}
        </Notice>
      </section>
    );
  }

  const days = fillDays(report, fromDay, toDay);
  const monthly = days.length > 62;
  const series = monthly ? groupMonths(days) : days;
  const peak = Math.max(1, ...series.map((d) => d.views));
  const dayCount = days.length;
  const pages = report.pages;
  const least = [...pages].reverse().slice(0, 10);

  const stats = [
    { label: "Unique visitors", value: report.visitors },
    { label: "Page views", value: report.views },
    { label: "Visits (sessions)", value: report.sessions },
    { label: "Avg. visitors / day", value: Math.round(days.reduce((s, d) => s + d.visitors, 0) / dayCount) },
  ];

  return (
    <section>
      {header}
      {filters}
      <p className="mt-3 text-xs text-ink-muted">Showing {fromDay} → {toDay} ({dayCount} day{dayCount === 1 ? "" : "s"})</p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{nf.format(s.value)}</p>
          </div>
        ))}
      </div>

      <div className={`${card} mt-4`}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-ink">{monthly ? "Monthly" : "Daily"} traffic</h2>
          <span className="flex items-center gap-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-brand-600" />Views</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-success" />Visitors</span>
          </span>
        </div>
        <div className="mt-4 flex h-48 items-end gap-[3px] overflow-x-auto" role="img" aria-label="Traffic chart">
          {series.map((d) => (
            <div key={d.day} className="group relative flex h-full min-w-[6px] flex-1 items-end gap-px"
              title={`${d.day}: ${d.visitors} visitors, ${d.views} views`}>
              <div className="w-1/2 rounded-t bg-brand-600/80" style={{ height: `${(d.views / peak) * 100}%` }} />
              <div className="w-1/2 rounded-t bg-success/80" style={{ height: `${(d.visitors / peak) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-muted">
          <span>{series[0]?.day}</span>
          <span>{series[series.length - 1]?.day}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="mb-4 text-base font-semibold text-ink">Most viewed pages</h2>
          <Bars total={report.views} rows={pages.slice(0, 12).map((p) => ({ label: p.path, value: p.views, sub: `${nf.format(p.visitors)} visitors` }))} />
        </div>
        <div className={card}>
          <h2 className="mb-4 text-base font-semibold text-ink">Least viewed pages</h2>
          <Bars total={report.views} rows={least.map((p) => ({ label: p.path, value: p.views, sub: `${nf.format(p.visitors)} visitors` }))} />
        </div>
        <div className={card}>
          <h2 className="mb-4 text-base font-semibold text-ink">Where visitors come from</h2>
          <Bars total={report.visitors} rows={report.referrers.map((r) => ({ label: r.source, value: r.visitors }))} />
        </div>
        <div className={card}>
          <h2 className="mb-4 text-base font-semibold text-ink">Devices</h2>
          <Bars total={report.visitors} rows={report.devices.map((d) => ({ label: d.device[0].toUpperCase() + d.device.slice(1), value: d.visitors }))} />
        </div>
      </div>

      {pages.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
          <h2 className="px-5 pt-5 text-base font-semibold text-ink">All pages ({pages.length})</h2>
          <div className="mt-3 max-h-[480px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                <tr><th className="px-5 py-2.5">Page</th><th className="px-5 py-2.5 text-right">Views</th><th className="px-5 py-2.5 text-right">Visitors</th></tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.path} className="border-b border-line last:border-0">
                    <td className="px-5 py-2 text-ink"><a href={p.path} target="_blank" rel="noreferrer" className="hover:underline">{p.path}</a></td>
                    <td className="px-5 py-2 text-right tabular-nums text-ink">{nf.format(p.views)}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-ink-muted">{nf.format(p.visitors)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
