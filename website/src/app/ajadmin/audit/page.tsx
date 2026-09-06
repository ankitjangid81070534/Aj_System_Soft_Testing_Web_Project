import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/States";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Audit Logs" },
  robots: { index: false, follow: false },
};

const PER_PAGE = 30;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string; action?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "audit:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role ({user.role}) does not include audit access. Admins and super admins only.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Audit logs</h1>
        <p
          role="status"
          className="mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Supabase is not configured yet.
        </p>
      </section>
    );
  }

  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const admin = createSupabaseAdminLooseClient();

  let base = admin.from("audit_logs").select("*", { count: "exact" });
  if (query.entity) base = base.eq("entity", query.entity);
  if (query.action) base = base.eq("action", query.action);

  const { data, count } = await base
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  function pageHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    if (query.entity) params.set("entity", query.entity);
    if (query.action) params.set("action", query.action);
    const search = params.toString();
    return `/ajadmin/audit${search ? `?${search}` : ""}`;
  }

  const entities = [
    "profiles",
    "site_settings",
    "page_sections",
    "services",
    "clients",
    "projects",
    "team_members",
    "testimonials",
    "blog_posts",
    "payment_links",
    "media_assets",
  ];

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Audit logs</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Database-triggered record of staff changes — read-only, cannot be edited or deleted.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Link
          href="/ajadmin/audit"
          aria-pressed={!query.entity}
          className={`rounded-full border px-3 py-1 text-xs font-medium focus-ring ${!query.entity ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-muted hover:text-ink"}`}
        >
          All entities
        </Link>
        {entities.map((entity) => (
          <Link
            key={entity}
            href={`/ajadmin/audit?entity=${entity}`}
            aria-pressed={query.entity === entity}
            className={`rounded-full border px-3 py-1 text-xs font-medium focus-ring ${query.entity === entity ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-muted hover:text-ink"}`}
          >
            {entity}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Audit log entries</caption>
              <thead>
                <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    When
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Actor
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Entity
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id)} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-2.5 text-xs text-ink-muted">
                      <time dateTime={String(row.created_at)}>
                        {new Date(String(row.created_at)).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </time>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{String(row.actor_email ?? "system")}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-ink">
                      {String(row.action)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-soft">{String(row.entity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No audit entries"
              description="Staff changes will be recorded here automatically."
            />
          </div>
        )}
      </div>
      {pageCount > 1 ? (
        <div className="mt-3 flex items-center justify-between text-sm text-ink-muted">
          <p>
            Page {page} of {pageCount} · {total} entries
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-ring"
              >
                Previous
              </Link>
            ) : null}
            {page < pageCount ? (
              <Link
                href={pageHref(page + 1)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-ring"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
