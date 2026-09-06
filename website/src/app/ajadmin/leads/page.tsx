import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { Input } from "@/components/ui/Input";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isLeadKind, LEAD_KINDS, listLeads, type LeadKind } from "@/lib/data/admin-leads";
import { LEAD_STATUSES } from "@/lib/validation/leads";

// Live inbox with per-request auth; never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Leads" },
  robots: { index: false, follow: false },
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  ...LEAD_STATUSES.map((status) => ({ value: status, label: status.replace("_", " ") })),
];

function inboxHref(kind: LeadKind, status?: string, q?: string): string {
  const params = new URLSearchParams();
  params.set("tab", kind);
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  return `/ajadmin/leads?${params.toString()}`;
}

export default async function LeadsInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <section>
        <p className="text-sm text-ink-muted">Session expired — sign in again.</p>
      </section>
    );
  }
  if (!can(user.role, "leads:read")) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Leads</h1>
        <p
          role="alert"
          className="mt-4 max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role ({user.role}) does not include lead access. Ask a super admin for access.
        </p>
      </section>
    );
  }

  const params = await searchParams;
  const kind: LeadKind = params.tab && isLeadKind(params.tab) ? params.tab : "quotes";
  const status = params.status ?? "";
  const q = params.q ?? "";

  const { rows, total, statusCounts } = await listLeads(kind, { status, q });

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Leads</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Contact submissions, quote requests and consultation bookings — newest first.
      </p>

      <div
        className="mt-5 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Lead types"
      >
        {LEAD_KINDS.map((entry) => (
          <Link
            key={entry.kind}
            href={inboxHref(entry.kind)}
            role="tab"
            aria-selected={entry.kind === kind}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-ring",
              entry.kind === kind
                ? "bg-brand-600 text-on-brand shadow-e2"
                : "border border-line bg-surface text-ink-muted hover:text-ink",
            )}
          >
            {entry.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const isActive = status === filter.value;
          const count = filter.value === "" ? total : (statusCounts[filter.value] ?? 0);
          return (
            <Link
              key={filter.value || "all"}
              href={inboxHref(kind, filter.value || undefined, q || undefined)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-ring",
                isActive
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {filter.label.charAt(0).toUpperCase() + filter.label.slice(1)}
              <span className="ml-1.5 text-[10px] text-ink-muted">{count}</span>
            </Link>
          );
        })}
      </div>

      <form action="/ajadmin/leads" method="get" className="mt-4 flex max-w-md gap-2">
        <input type="hidden" name="tab" value={kind} />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, text…"
          aria-label="Search leads"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-ring"
        >
          Search
        </button>
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        {rows.length > 0 ? (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{kind} leads</caption>
            <thead>
              <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  Lead
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Received
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 hover:bg-canvas/50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{row.title}</p>
                    <p className="text-xs text-ink-muted">{row.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-ink-muted md:table-cell">
                    <time dateTime={row.created_at}>
                      {new Date(row.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/ajadmin/leads/${kind}/${row.id}`}
                      className="rounded-full border border-line px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 focus-ring"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No leads here yet"
              description={
                q || status
                  ? "Try clearing the search or status filter."
                  : "Submissions from the contact and quote forms will appear here."
              }
            />
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-muted" role="status">
        {total} {total === 1 ? "lead" : "leads"} shown · newest first
      </p>
    </section>
  );
}
