import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { StatusPill } from "@/components/ui/Badge";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { saveSectionAction } from "@/lib/admin/builder-actions";
import { SECTION_LABELS } from "@/lib/admin/builder-labels";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Edit Section" },
  robots: { index: false, follow: false },
};

const SECTION_TYPES = [
  "hero",
  "trust_strip",
  "services_overview",
  "platforms",
  "featured_projects",
  "process",
  "industries",
  "tech_capabilities",
  "why_us",
  "testimonials",
  "team",
  "gallery",
  "faq",
  "cta",
] as const;

const VARIANT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  hero: [
    { value: "default", label: "Default (text left, visual right)" },
    { value: "centered", label: "Centered" },
  ],
  gallery: [
    { value: "default", label: "Grid (3 columns)" },
    { value: "split", label: "Two columns" },
  ],
  cta: [
    { value: "default", label: "Bordered band" },
    { value: "centered", label: "Centered card" },
  ],
};

const ACCENT_OPTIONS = [
  { value: "brand", label: "Brand blue" },
  { value: "ink", label: "Ink (dark)" },
  { value: "slate", label: "Soft slate" },
] as const;

const contentSchema = z.object({}).passthrough();

export default async function SectionEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  if (!isSupabaseConfigured) return <SetupNotice module="The home page builder" />;

  const { id } = await params;
  const feedback = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "content:write")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role cannot edit the page builder.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) notFound();

  const admin = createSupabaseAdminLooseClient();
  const { data: rows } = await admin.from("page_sections").select("*").eq("id", id).limit(1);
  const section = rows?.[0];
  if (!section) notFound();

  const contentJson = JSON.stringify(section.content ?? {}, null, 2);
  const isNew = false;

  return (
    <section>
      <Link
        href="/ajadmin/home"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink focus-ring rounded-sm"
      >
        ← Back to home builder
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {SECTION_LABELS[String(section.section_type)] ?? String(section.section_type)} section
        </h1>
        <StatusPill status={String(section.status)} />
        {isNew ? null : null}
      </div>

      {feedback.notice ? (
        <p
          role="status"
          className="mt-4 max-w-4xl rounded-xl bg-success-soft px-4 py-3 text-sm text-success"
        >
          {feedback.notice}
        </p>
      ) : null}
      {feedback.error ? (
        <p
          role="alert"
          className="mt-4 max-w-4xl rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {feedback.error}
        </p>
      ) : null}

      <form
        action={saveSectionAction}
        className="mt-5 grid max-w-4xl gap-4 rounded-2xl border border-line bg-surface p-6 shadow-e1 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={id} />
        <Field label="Section type (fixed)" htmlFor="sec-type">
          <Select
            id="sec-type"
            name="section_type"
            defaultValue={String(section.section_type)}
            disabled
          >
            {SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="sec-status">
          <Select id="sec-status" name="status" defaultValue={String(section.status)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
        <Field label="Layout variant (approved presets)" htmlFor="sec-variant">
          <Select
            id="sec-variant"
            name="variant"
            defaultValue={String(section.variant ?? "default")}
          >
            {(
              VARIANT_OPTIONS[String(section.section_type)] ?? [
                { value: "default", label: "Default" },
              ]
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Accent preset" htmlFor="sec-accent">
          <Select id="sec-accent" name="accent" defaultValue={String(section.accent ?? "brand")}>
            {ACCENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sort order" htmlFor="sec-sort">
          <Input
            id="sec-sort"
            name="sort_order"
            type="number"
            defaultValue={String(section.sort_order ?? 0)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Content (JSON — validated)"
            htmlFor="sec-content"
            hint="Structured content only. Invalid JSON or unknown shapes are rejected on save; raw HTML/JavaScript is never rendered."
          >
            <Textarea
              id="sec-content"
              name="content"
              rows={14}
              defaultValue={contentJson}
              className="font-mono text-xs"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <AdminSubmitButton idleLabel="Save section" pendingLabel="Saving section…" />
        </div>
      </form>
      <p className="mt-3 max-w-3xl text-xs text-ink-muted">
        {`Validation: ${contentSchema.description ?? "content must parse as JSON and match the section's registered schema (e.g. gallery images)"}.`}
      </p>
    </section>
  );
}
