import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteCopyForm } from "@/components/admin/SiteCopyForm";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Website text" },
  robots: { index: false, follow: false },
};

export default async function SiteCopyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "settings:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role ({user.role}) does not include settings access.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Website text</h1>
        <p
          role="status"
          className="mt-4 max-w-xl rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Supabase is not configured yet.
        </p>
      </section>
    );
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: rows, error } = await admin.from("site_copy").select("key, value");
  const values: Record<string, string> = {};
  for (const row of rows ?? []) {
    if (typeof row.key === "string" && typeof row.value === "string") values[row.key] = row.value;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Website text</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Every heading, eyebrow, paragraph, button label and list on the homepage. Leave a field empty
        to keep the built-in text shown as its placeholder. Confirmed saves refresh the public site
        without a redeploy.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-4 max-w-2xl rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Website text could not be read ({error.message}). Run
          <code className="mx-1">supabase/migrations/0018_site_copy.sql</code> in Supabase, then
          reload this page.
        </p>
      ) : null}
      <SiteCopyForm values={values} />
    </section>
  );
}
