import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { reorderSectionAction, toggleSectionVisibilityAction } from "@/lib/admin/builder-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Home Page Builder" },
  robots: { index: false, follow: false },
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  trust_strip: "Trust strip",
  services_overview: "Services overview",
  platforms: "Platforms we build for",
  featured_projects: "Featured projects",
  process: "Development process",
  industries: "Industries",
  tech_capabilities: "Technology capabilities",
  why_us: "Why choose us",
  testimonials: "Testimonials",
  team: "Team",
  gallery: "Gallery",
  faq: "FAQ",
  cta: "Final CTA",
};

export default async function HomeBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  if (!isSupabaseConfigured) return <SetupNotice module="The home page builder" />;

  const user = await getCurrentUser();
  const feedback = await searchParams;
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "content:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role does not include access to the page builder.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Home page builder</h1>
        <p
          role="status"
          className="mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Supabase is not configured yet.
        </p>
      </section>
    );
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: sections } = await admin
    .from("page_sections")
    .select("*")
    .eq("page", "home")
    .order("sort_order", { ascending: true });
  const rows = sections ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Home page builder</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Structured sections only — content is validated, never raw HTML/JavaScript.
          </p>
        </div>
        <Link
          href="/ajadmin/home/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-on-brand shadow-e2 transition-colors hover:bg-brand-700 focus-ring"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add section
        </Link>
      </div>

      {feedback.notice ? (
        <p role="status" className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          {feedback.notice}
        </p>
      ) : null}
      {feedback.error ? (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {feedback.error}
        </p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        {rows.length > 0 ? (
          <ul className="divide-y divide-line">
            {rows.map((section, index) => {
              const id = String(section.id);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xs font-semibold text-ink-muted">#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {SECTION_LABELS[String(section.section_type)] ??
                          String(section.section_type)}
                        {section.variant && section.variant !== "default" ? (
                          <span className="ml-2 text-xs text-ink-muted">
                            variant: {String(section.variant)}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-ink-muted">accent: {String(section.accent)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill status={String(section.status)} />
                    <form action={toggleSectionVisibilityAction}>
                      <input type="hidden" name="id" value={id} />
                      <button
                        type="submit"
                        className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-ring"
                      >
                        {section.is_visible ? "Hide" : "Show"}
                      </button>
                    </form>
                    <form action={reorderSectionAction}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        aria-label="Move section up"
                        disabled={index === 0}
                        className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-canvas-raised hover:text-ink focus-ring disabled:opacity-40"
                      >
                        <ArrowUp aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={reorderSectionAction}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        aria-label="Move section down"
                        disabled={index === rows.length - 1}
                        className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-canvas-raised hover:text-ink focus-ring disabled:opacity-40"
                      >
                        <ArrowDown aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </form>
                    <Link
                      href={`/ajadmin/home/${id}`}
                      aria-label="Edit section"
                      className="rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:text-ink focus-ring"
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">
            No sections yet — the home page falls back to its built-in layout. Add a section to
            override part of it.
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Published + visible sections drive the public home page; drafts and hidden ones are skipped.
        Sections removed here fall back to built-in defaults.
      </p>
    </section>
  );
}
