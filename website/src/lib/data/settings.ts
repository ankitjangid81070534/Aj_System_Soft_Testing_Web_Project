import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

import { ctaHrefOrDefault, DEFAULT_CTA_LABEL, textOrDefault } from "@/lib/data/cta";

export { DEFAULT_CTA_HREF, DEFAULT_CTA_LABEL } from "@/lib/data/cta";

import { getSocialLinks } from "@/lib/data/growth";

export type SocialLink = { label: string; url: string; platform?: string };

export type SiteSettings = {
  brandName: string;
  brandShortName: string;
  companyLegalName: string | null;
  tagline: string;
  phone: string | null;
  whatsapp: string | null;
  contactEmail: string | null;
  supportEmail: string | null;
  addressLine: string | null;
  mapUrl: string | null;
  socialLinks: SocialLink[];
  businessHours: string | null;
  globalCtaLabel: string;
  globalCtaHref: string;
};

/**
 * Public site settings (RLS allows anon read). Null when Supabase is not
 * configured yet — callers hide settings-driven UI (WhatsApp CTA, contact
 * details) instead of showing placeholder facts.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const supabase = createSupabasePublicClient();
      const [settingsRes, socialLinks] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", true).limit(1),
        getSocialLinks(),
      ]);
      const data = settingsRes.data;
      const row = data?.[0];
      if (!row) return null;

      return {
        brandName: textOrDefault(row.brand_name, "AJ System Soft Technology"),
        brandShortName: textOrDefault(row.brand_short_name, "AJS Technology"),
        companyLegalName: row.company_legal_name ?? null,
        tagline: row.tagline,
        phone: row.phone,
        whatsapp: row.whatsapp,
        contactEmail: row.contact_email,
        supportEmail: row.support_email,
        addressLine: row.address_line,
        mapUrl: row.map_url,
        socialLinks: socialLinks.map(s => ({ label: s.label, url: s.url, platform: s.platform })),
        businessHours: row.business_hours,
        globalCtaLabel: textOrDefault(row.global_cta_label, DEFAULT_CTA_LABEL),
        globalCtaHref: ctaHrefOrDefault(row.global_cta_href),
      };
    } catch {
      return null;
    }
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 300 },
);

/** WhatsApp deep link, only when a number is configured. */
export function whatsappLink(settings: SiteSettings | null): string | null {
  if (!settings?.whatsapp) return null;
  const digits = settings.whatsapp.replace(/[^0-9]/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}
