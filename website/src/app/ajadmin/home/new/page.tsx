import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Field, Select } from "@/components/ui/Input";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSectionAction } from "@/lib/admin/builder-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Add Section" },
  robots: { index: false, follow: false },
};

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "trust_strip", label: "Trust strip" },
  { value: "services_overview", label: "Services overview" },
  { value: "platforms", label: "Platforms we build for" },
  { value: "featured_projects", label: "Featured projects" },
  { value: "process", label: "Development process" },
  { value: "industries", label: "Industries" },
  { value: "tech_capabilities", label: "Technology capabilities" },
  { value: "why_us", label: "Why choose us" },
  { value: "testimonials", label: "Testimonials" },
  { value: "team", label: "Team" },
  { value: "gallery", label: "Gallery" },
  { value: "faq", label: "FAQ" },
  { value: "cta", label: "Final CTA" },
] as const;

export default async function NewSectionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const feedback = await searchParams;
  if (!isSupabaseConfigured) return <SetupNotice module="The home page builder" />;

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

  return (
    <section>
      <Link
        href="/ajadmin/home"
        className="text-sm font-medium text-ink-muted hover:text-ink focus-ring rounded-sm"
      >
        ← Back to home builder
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Add home page section</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        New sections start as drafts with empty content — open them to add the validated content
        payload, then publish.
      </p>
      {feedback.error ? (
        <p
          role="alert"
          className="mt-4 max-w-md rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {feedback.error}
        </p>
      ) : null}
      <form action={createSectionAction} className="mt-6 flex max-w-md items-end gap-3">
        <Field label="Section type" htmlFor="new-section-type">
          <Select
            id="new-section-type"
            name="section_type"
            defaultValue="gallery"
            className="min-w-56"
          >
            {SECTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </Field>
        <AdminSubmitButton idleLabel="Add section" pendingLabel="Adding section…" />
      </form>
    </section>
  );
}
