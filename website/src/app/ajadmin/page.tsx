import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { can, ROLE_LABELS } from "@/lib/auth/permissions";
import { signOutAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Dashboard" },
  robots: { index: false, follow: false },
};

const CONTENT_TABLES = [
  { label: "Services", table: "services", href: "/ajadmin/c/services", Icon: LayoutDashboard },
  { label: "Projects", table: "projects", href: "/ajadmin/c/projects", Icon: FolderKanban },
  { label: "Team members", table: "team_members", href: "/ajadmin/c/team", Icon: BarChart3 },
  { label: "Testimonials", table: "testimonials", href: "/ajadmin/c/testimonials", Icon: Sparkles },
  { label: "Blog posts", table: "blog_posts", href: "/ajadmin/c/posts", Icon: FileText },
] as const;

async function countRows(table: string, filters: Record<string, unknown>): Promise<number> {
  const admin = createSupabaseAdminLooseClient();
  let query = admin.from(table).select("id", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filters)) {
    if (value === null) query = query.is(column, null);
    else query = query.eq(column, value);
  }
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-line bg-surface p-7 text-center shadow-e3 sm:p-10">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
            <Settings aria-hidden="true" className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink">
            Complete admin setup
          </h1>
          <p role="status" className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-muted">
            Connect the production Supabase environment and apply migrations 0001–0012 before using
            the CMS. The public fallback site remains available while setup is incomplete.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-canvas focus-ring"
          >
            View public website <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const user = await getCurrentUser();
  if (!user || !can(user.role, "content:read")) {
    return (
      <section>
        <p className="text-sm text-ink-muted">Session expired - sign in again.</p>
      </section>
    );
  }

  const counts = await Promise.all(
    CONTENT_TABLES.map(async (entry) => {
      const [published, drafts] = await Promise.all([
        countRows(entry.table, { status: "published", deleted_at: null }),
        countRows(entry.table, { status: "draft", deleted_at: null }),
      ]);
      return { ...entry, published, drafts };
    }),
  );

  // The service-role client bypasses RLS: enforce lead access before querying,
  // not merely by hiding links in the staff shell.
  const canReadLeads = can(user.role, "leads:read");
  const { data: recentLeads, error: leadsError } = canReadLeads
    ? await createSupabaseAdminLooseClient()
        .from("quote_requests")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null, error: null };

  return (
    <section className="mx-auto max-w-[90rem]">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-6 shadow-e3 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl dark:bg-brand-100/5"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                Operations online
              </span>
              <span className="text-xs text-ink-muted">{ROLE_LABELS[user.role]}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">
              Good to see you{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              Manage published content, incoming opportunities, client proof and site operations
              from one focused workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canReadLeads && <Link
              href="/ajadmin/leads"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink shadow-e1 hover:shadow-e2 focus-ring"
            >
              <Inbox aria-hidden="true" className="h-4 w-4 text-brand-600" />
              Open lead inbox
            </Link>}
            <Link
              href="/ajadmin/c/projects/new"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-on-brand shadow-e2 hover:bg-brand-700 focus-ring"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New project
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {counts.map((entry) => (
          <Link
            key={entry.label}
            href={entry.href}
            className="group card-3d rounded-3xl border border-line bg-surface p-5 shadow-e1 transition-all hover:-translate-y-1 hover:border-line-strong hover:shadow-e3 focus-ring"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <entry.Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-muted">
              {entry.label}
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-tight text-ink">{entry.published}</p>
              <p className="pb-1 text-xs text-ink-muted">
                {entry.drafts} draft{entry.drafts === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {canReadLeads && <div className="rounded-3xl border border-line bg-surface p-5 shadow-e2 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Latest quote requests</h2>
            <Link
              href="/ajadmin/leads?tab=quotes"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 focus-ring rounded-sm"
            >
              Open inbox
            </Link>
          </div>
          {leadsError ? (
            <p role="alert" className="mt-3 text-sm text-ink-muted">
              Quote requests could not be loaded. Please try again.
            </p>
          ) : recentLeads && recentLeads.length > 0 ? (
            <ul className="mt-3 divide-y divide-line">
              {recentLeads.map((lead) => (
                <li
                  key={String(lead.id)}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium text-ink">{String(lead.full_name)}</span>
                    <span className="text-ink-muted"> - {String(lead.email)}</span>
                  </span>
                  <time
                    className="shrink-0 text-xs text-ink-muted"
                    dateTime={String(lead.created_at)}
                  >
                    {new Date(String(lead.created_at)).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No quote requests yet.</p>
          )}
        </div>}

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-e2 sm:p-6">
          <h2 className="text-sm font-semibold text-ink">Quick actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { href: "/ajadmin/c/posts/new", label: "New blog post" },
              { href: "/ajadmin/c/projects/new", label: "New project" },
              { href: "/ajadmin/media", label: "Upload media" },
              { href: "/ajadmin/home", label: "Edit home page" },
              { href: "/ajadmin/brand", label: "Brand settings" },
              { href: "/ajadmin/audit", label: "Audit logs" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-raised focus-ring"
              >
                {action.label}
              </Link>
            ))}
          </div>
          <form action={signOutAction} className="mt-5">
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-ring"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
