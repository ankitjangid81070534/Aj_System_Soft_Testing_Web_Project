import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandSettingsForm, type BrandSettingsValues } from "@/components/admin/BrandSettingsForm";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Brand & Settings" },
  robots: { index: false, follow: false },
};

export default async function BrandSettingsPage() {
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
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Brand & settings</h1>
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
  const { data: rows } = await admin.from("site_settings").select("*").eq("id", true).limit(1);
  const settings = (rows?.[0] ?? {}) as Record<string, unknown>;
  const str = (key: string): string =>
    typeof settings[key] === "string" ? (settings[key] as string) : "";

  const initial: BrandSettingsValues = {
    brand_name: str("brand_name"),
    brand_short_name: str("brand_short_name"),
    tagline: str("tagline"),
    business_hours: str("business_hours"),
    contact_email: str("contact_email"),
    support_email: str("support_email"),
    phone: str("phone"),
    whatsapp: str("whatsapp"),
    address_line: str("address_line"),
    map_url: str("map_url"),
    global_cta_label: str("global_cta_label"),
    global_cta_href: str("global_cta_href"),
    company_description: str("company_description"),
    company_legal_name: str("company_legal_name"),
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Brand & settings</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Site-wide identity and contact details. Confirmed saves refresh the public site without a
        redeploy.
      </p>
      <BrandSettingsForm initial={initial} />
    </section>
  );
}
