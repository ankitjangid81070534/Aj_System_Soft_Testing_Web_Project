import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { asStringArray } from "@/lib/data/jsonb";

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

/**
 * Sales-conversion content managed from the admin (migration 0017):
 * trusted clients (trust strip), case studies and packages.
 *
 * Reader contract mirrors `getLaunchBenefits`: fallback copy when Supabase is
 * not configured or the read fails; an EMPTY list when the table exists but
 * the admin has no active rows (the section then hides).
 */

type Row = Record<string, unknown>;

export type TrustedClient = {
  id: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
};

export type CaseStudyMetric = { value: string; label: string };

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  clientName: string | null;
  industry: string | null;
  platform: string | null;
  summary: string | null;
  challenge: string | null;
  solution: string | null;
  results: string[];
  metrics: CaseStudyMetric[];
  durationLabel: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isFeatured: boolean;
};

export type Package = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  priceLabel: string | null;
  priceNote: string | null;
  badgeLabel: string | null;
  features: string[];
  idealFor: string | null;
  deliveryLabel: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isHighlighted: boolean;
};

/* ------------------------------------------------------------------------ */
/* Fallbacks — identical to the 0017 seed rows so the preview matches prod.  */
/* ------------------------------------------------------------------------ */

export const FALLBACK_TRUSTED_CLIENTS: TrustedClient[] = [
  { id: "fb-1", name: "Shree Balaji Traders", industry: "Retail & Wholesale", logoUrl: null, websiteUrl: null },
  { id: "fb-2", name: "Jangid Hospital", industry: "Healthcare", logoUrl: null, websiteUrl: null },
  { id: "fb-3", name: "Rajasthan Agro Mills", industry: "Manufacturing", logoUrl: null, websiteUrl: null },
  { id: "fb-4", name: "Hotel Sunrise Palace", industry: "Hospitality", logoUrl: null, websiteUrl: null },
  { id: "fb-5", name: "Mehta Pharma Distributors", industry: "Pharma", logoUrl: null, websiteUrl: null },
  { id: "fb-6", name: "City Public School", industry: "Education", logoUrl: null, websiteUrl: null },
  { id: "fb-7", name: "Jaipur Realty Group", industry: "Real Estate", logoUrl: null, websiteUrl: null },
  { id: "fb-8", name: "Sharma Electronics", industry: "Electronics Retail", logoUrl: null, websiteUrl: null },
];

export const FALLBACK_CASE_STUDIES: CaseStudy[] = [
  {
    id: "fb-cs-1",
    title: "GST billing & inventory software for a wholesale trader",
    slug: "wholesale-billing-inventory",
    clientName: "Shree Balaji Traders",
    industry: "Retail & Wholesale",
    platform: "Windows desktop + Android",
    summary:
      "Replaced manual registers and Excel with a single GST-ready billing and stock system used across 2 godowns.",
    challenge:
      "Bills took 5–7 minutes each, stock mismatches every month, GST filing needed an accountant for 3 days.",
    solution:
      "Custom desktop billing app with barcode scanning, live stock across godowns, one-click GSTR reports and an Android app for the owner.",
    results: [
      "Billing time cut from 6 min to under 1 min",
      "Zero stock mismatch in the last 6 months",
      "GSTR-1 / 3B reports generated in one click",
      "Owner sees daily sales on his phone",
    ],
    metrics: [
      { value: "85%", label: "faster billing" },
      { value: "₹0", label: "stock loss last quarter" },
      { value: "3 wks", label: "to go live" },
    ],
    durationLabel: "Delivered in 3 weeks",
    imageUrl: null,
    ctaLabel: null,
    ctaUrl: null,
    isFeatured: true,
  },
  {
    id: "fb-cs-2",
    title: "Hospital management system with OPD, IPD and pharmacy",
    slug: "hospital-management-system",
    clientName: "Jangid Hospital",
    industry: "Healthcare",
    platform: "Web application",
    summary:
      "A 40-bed hospital moved from paper files to a web HMS covering registration, OPD queue, IPD billing and pharmacy.",
    challenge:
      "Patient files were lost, OPD queues were chaotic and discharge billing took hours with frequent errors.",
    solution:
      "Web-based HMS with token display, doctor dashboards, automated IPD billing, pharmacy stock and WhatsApp report delivery to patients.",
    results: [
      "Discharge billing down from 3 hours to 20 minutes",
      "OPD waiting time reduced by 40%",
      "Patient reports delivered on WhatsApp automatically",
      "Complete audit trail for every bill",
    ],
    metrics: [
      { value: "40%", label: "less OPD waiting" },
      { value: "20 min", label: "discharge billing" },
      { value: "100%", label: "digital records" },
    ],
    durationLabel: "Delivered in 6 weeks",
    imageUrl: null,
    ctaLabel: null,
    ctaUrl: null,
    isFeatured: true,
  },
  {
    id: "fb-cs-3",
    title: "Production planning & dispatch ERP for an agro mill",
    slug: "agro-mill-production-erp",
    clientName: "Rajasthan Agro Mills",
    industry: "Manufacturing",
    platform: "Web + Android",
    summary:
      "Custom ERP tracking raw material intake, production batches, quality checks and dispatch for a flour mill.",
    challenge:
      "No visibility of yield per batch, dispatch errors and disputes with transporters over quantities.",
    solution:
      "ERP with weighbridge integration, batch-wise yield reports, QR-coded dispatch challans and a driver app for delivery confirmation.",
    results: [
      "Yield visibility per batch for the first time",
      "Dispatch disputes down by 90%",
      "Management dashboard updated every 15 minutes",
      "Weighbridge data captured automatically",
    ],
    metrics: [
      { value: "90%", label: "fewer dispatch disputes" },
      { value: "15 min", label: "live dashboard refresh" },
      { value: "2×", label: "faster month-end closing" },
    ],
    durationLabel: "Delivered in 8 weeks",
    imageUrl: null,
    ctaLabel: null,
    ctaUrl: null,
    isFeatured: true,
  },
];

export const FALLBACK_PACKAGES: Package[] = [
  {
    id: "fb-pk-1",
    name: "Starter",
    slug: "starter",
    tagline: "One focused app to fix your biggest daily problem.",
    priceLabel: "Starts from ₹25,000",
    priceNote: "One-time · milestone-based payment",
    badgeLabel: null,
    features: [
      "Single platform (web, desktop or Android)",
      "Up to 5 core modules",
      "Basic reports & exports",
      "30 days post-launch support",
      "Source code ownership",
    ],
    idealFor: "Shops, clinics, small offices",
    deliveryLabel: "2–4 weeks",
    ctaLabel: "Get a Starter quote",
    ctaUrl: "/request-quote",
    isHighlighted: false,
  },
  {
    id: "fb-pk-2",
    name: "Business",
    slug: "business",
    tagline: "Complete software for a growing business.",
    priceLabel: "Starts from ₹75,000",
    priceNote: "One-time · milestone-based payment",
    badgeLabel: "Most popular",
    features: [
      "Web + mobile app",
      "Unlimited modules & user roles",
      "GST billing, inventory, CRM or HMS",
      "WhatsApp / SMS / email automation",
      "90 days support + training",
      "Source code ownership",
    ],
    idealFor: "Hospitals, distributors, manufacturers",
    deliveryLabel: "4–8 weeks",
    ctaLabel: "Get a Business quote",
    ctaUrl: "/request-quote",
    isHighlighted: true,
  },
  {
    id: "fb-pk-3",
    name: "Enterprise",
    slug: "enterprise",
    tagline: "Multi-branch systems, integrations and a dedicated team.",
    priceLabel: "Custom quote",
    priceNote: "Fixed price or monthly retainer",
    badgeLabel: null,
    features: [
      "Multi-branch / multi-company",
      "ERP, API & hardware integrations",
      "Cloud hosting, backups & security",
      "Dedicated project manager",
      "12 months support & SLA",
      "Source code ownership",
    ],
    idealFor: "Groups, franchises, institutions",
    deliveryLabel: "8+ weeks",
    ctaLabel: "Talk to us",
    ctaUrl: "/contact#consultation",
    isHighlighted: false,
  },
];

/* ------------------------------------------------------------------------ */
/* Mappers                                                                   */
/* ------------------------------------------------------------------------ */

function mapTrustedClient(row: Row): TrustedClient | null {
  const name = text(row.name);
  if (!name) return null;
  return {
    id: String(row.id),
    name,
    industry: text(row.industry),
    logoUrl: text(row.logo_url),
    websiteUrl: text(row.website_url),
  };
}

function mapCaseStudy(row: Row): CaseStudy | null {
  const title = text(row.title);
  const slug = text(row.slug);
  if (!title || !slug) return null;
  const metrics: CaseStudyMetric[] = [];
  for (const n of [1, 2, 3]) {
    const value = text(row[`metric_${n}_value`]);
    const label = text(row[`metric_${n}_label`]);
    if (value && label) metrics.push({ value, label });
  }
  return {
    id: String(row.id),
    title,
    slug,
    clientName: text(row.client_name),
    industry: text(row.industry),
    platform: text(row.platform),
    summary: text(row.summary),
    challenge: text(row.challenge),
    solution: text(row.solution),
    results: asStringArray(row.results),
    metrics,
    durationLabel: text(row.duration_label),
    imageUrl: text(row.image_url),
    ctaLabel: text(row.cta_label),
    ctaUrl: text(row.cta_url),
    isFeatured: row.is_featured === true,
  };
}

function mapPackage(row: Row): Package | null {
  const name = text(row.name);
  const slug = text(row.slug);
  if (!name || !slug) return null;
  return {
    id: String(row.id),
    name,
    slug,
    tagline: text(row.tagline),
    priceLabel: text(row.price_label),
    priceNote: text(row.price_note),
    badgeLabel: text(row.badge_label),
    features: asStringArray(row.features),
    idealFor: text(row.ideal_for),
    deliveryLabel: text(row.delivery_label),
    ctaLabel: text(row.cta_label),
    ctaUrl: text(row.cta_url),
    isHighlighted: row.is_highlighted === true,
  };
}

/* ------------------------------------------------------------------------ */
/* Readers                                                                   */
/* ------------------------------------------------------------------------ */

export const getTrustedClients = unstable_cache(
  async (): Promise<TrustedClient[]> => {
    if (!isSupabaseConfigured) return FALLBACK_TRUSTED_CLIENTS;
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("trusted_clients")
        .select("id, name, industry, logo_url, website_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(24);
      if (error) return FALLBACK_TRUSTED_CLIENTS;
      if (!data || data.length === 0) return [];
      return (data as Row[]).map(mapTrustedClient).filter((item): item is TrustedClient => item !== null);
    } catch {
      return FALLBACK_TRUSTED_CLIENTS;
    }
  },
  ["trusted-clients"],
  { tags: ["trusted-clients"], revalidate: 300 },
);

export const getCaseStudies = unstable_cache(
  async (): Promise<CaseStudy[]> => {
    if (!isSupabaseConfigured) return FALLBACK_CASE_STUDIES;
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("case_studies")
        .select("*")
        .eq("status", "published")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .limit(6);
      if (error) return FALLBACK_CASE_STUDIES;
      if (!data || data.length === 0) return [];
      return (data as Row[]).map(mapCaseStudy).filter((item): item is CaseStudy => item !== null);
    } catch {
      return FALLBACK_CASE_STUDIES;
    }
  },
  ["case-studies"],
  { tags: ["case-studies"], revalidate: 300 },
);

export const getPackages = unstable_cache(
  async (): Promise<Package[]> => {
    if (!isSupabaseConfigured) return FALLBACK_PACKAGES;
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("status", "published")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .limit(4);
      if (error) return FALLBACK_PACKAGES;
      if (!data || data.length === 0) return [];
      return (data as Row[]).map(mapPackage).filter((item): item is Package => item !== null);
    } catch {
      return FALLBACK_PACKAGES;
    }
  },
  ["packages"],
  { tags: ["packages"], revalidate: 300 },
);
