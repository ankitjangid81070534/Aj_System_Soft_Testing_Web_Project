import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { asStringArray } from "@/lib/data/jsonb";

/**
 * Public readers for the Supabase-managed growth content: offers, updates /
 * announcements, launch benefits and social links. Every query runs through
 * the anon client, so RLS (published + active + inside the schedule window)
 * is the source of truth; the extra filters here only keep the cache honest.
 *
 * When Supabase is not configured the site renders sensible built-in
 * fallbacks for benefits and hides the optional offer/update surfaces.
 */

export type Offer = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  imageUrl: string | null;
  originalPrice: number | null;
  offerPrice: number | null;
  discountLabel: string | null;
  offerCode: string | null;
  offerType: string;
  freeOrPaid: "free" | "paid";
  tags: string[];
  ctaLabel: string | null;
  ctaUrl: string | null;
  startAt: string | null;
  endAt: string | null;
  isFeatured: boolean;
  popupEnabled: boolean;
  popupPriority: number;
  popupFrequency: "every_visit" | "once_per_session" | "once_per_day" | "custom";
  popupCustomHours: number | null;
  showOnHome: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  updateType: string;
  freeOrPaid: "free" | "paid";
  priceLabel: string | null;
  imageUrl: string | null;
  icon: string | null;
  badgeLabel: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  priority: number;
  displayPosition: "top_bar" | "homepage" | "side_floating" | "update_center" | "footer";
  isDismissible: boolean;
  startAt: string | null;
  endAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type LaunchBenefit = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
};

export type SocialPlatform =
  | "whatsapp"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "facebook"
  | "x"
  | "github"
  | "telegram"
  | "website";

export type SocialLinkItem = { id: string; platform: SocialPlatform; label: string; url: string };

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  "whatsapp",
  "instagram",
  "youtube",
  "linkedin",
  "facebook",
  "x",
  "github",
  "telegram",
  "website",
];

export const UPDATE_TYPE_LABELS: Record<string, string> = {
  product_update: "Product update",
  new_feature: "New feature",
  free_update: "Free update",
  paid_update: "Paid update",
  service_update: "Service update",
  maintenance: "Maintenance",
  company_news: "Company news",
  promotion: "Promotion",
};

export const OFFER_TYPE_LABELS: Record<string, string> = {
  discount: "Discount",
  free: "Free",
  bundle: "Bundle",
  limited_time: "Limited time",
  launch: "Launch offer",
  seasonal: "Seasonal",
  custom: "Special",
};

export const FALLBACK_BENEFITS: LaunchBenefit[] = [
  {
    id: "fallback-support",
    title: "6 Months Support",
    description:
      "Bug fixes and technical support for six months after delivery, as described in the Service Agreement.",
    icon: "life-buoy",
  },
  {
    id: "fallback-customization",
    title: "6 Months Eligible Customization",
    description:
      "Reasonable, in-scope adjustments for six months so the product keeps matching how you work.",
    icon: "sliders",
  },
  {
    id: "fallback-android",
    title: "1 Year Android App Offer",
    description:
      "Eligible website and software projects can add a companion Android app under the current offer terms.",
    icon: "smartphone",
  },
  {
    id: "fallback-seo",
    title: "SEO / Search Setup Assistance",
    description:
      "Technical SEO foundations, indexing setup and structured data — no ranking guarantees, just correct groundwork.",
    icon: "search",
  },
  {
    id: "fallback-portal",
    title: "Client / Admin Portal",
    description:
      "Where applicable, a secure portal to manage content, leads and documents without depending on us for every change.",
    icon: "layout-dashboard",
  },
  {
    id: "fallback-custom",
    title: "Custom Requirement-Based Development",
    description: "Every project is scoped around your actual requirements — no forced templates.",
    icon: "code",
  },
];

type Row = Record<string, unknown>;

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;
const num = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
    return Number(value);
  return null;
};
const bool = (value: unknown): boolean => value === true;

function isHttpsOrPath(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function toOffer(row: Row): Offer | null {
  const title = text(row.title);
  const slug = text(row.slug);
  if (!title || !slug) return null;
  const frequency = text(row.popup_frequency);
  return {
    id: String(row.id),
    title,
    slug,
    shortDescription: text(row.short_description),
    fullDescription: text(row.full_description),
    imageUrl: isHttpsOrPath(text(row.image_url)),
    originalPrice: num(row.original_price),
    offerPrice: num(row.offer_price),
    discountLabel: text(row.discount_label),
    offerCode: text(row.offer_code),
    offerType: text(row.offer_type) ?? "discount",
    freeOrPaid: row.free_or_paid === "free" ? "free" : "paid",
    tags: asStringArray(row.tags),
    ctaLabel: text(row.cta_label),
    ctaUrl: isHttpsOrPath(text(row.cta_url)),
    startAt: text(row.start_at),
    endAt: text(row.end_at),
    isFeatured: bool(row.is_featured),
    popupEnabled: bool(row.popup_enabled),
    popupPriority: num(row.popup_priority) ?? 0,
    popupFrequency:
      frequency === "every_visit" ||
      frequency === "once_per_session" ||
      frequency === "once_per_day" ||
      frequency === "custom"
        ? frequency
        : "once_per_day",
    popupCustomHours: num(row.popup_custom_hours),
    showOnHome: row.show_on_home !== false,
    seoTitle: text(row.seo_title),
    seoDescription: text(row.seo_description),
    updatedAt: text(row.updated_at) ?? new Date(0).toISOString(),
  };
}

function toAnnouncement(row: Row): Announcement | null {
  const title = text(row.title);
  const slug = text(row.slug);
  if (!title || !slug) return null;
  const position = text(row.display_position);
  return {
    id: String(row.id),
    title,
    slug,
    summary: text(row.summary),
    body: text(row.body),
    updateType: text(row.update_type) ?? "product_update",
    freeOrPaid: row.free_or_paid === "paid" ? "paid" : "free",
    priceLabel: text(row.price_label),
    imageUrl: isHttpsOrPath(text(row.image_url)),
    icon: text(row.icon),
    badgeLabel: text(row.badge_label),
    ctaLabel: text(row.cta_label),
    ctaUrl: isHttpsOrPath(text(row.cta_url)),
    priority: num(row.priority) ?? 0,
    displayPosition:
      position === "top_bar" ||
      position === "homepage" ||
      position === "side_floating" ||
      position === "footer"
        ? position
        : "update_center",
    isDismissible: row.is_dismissible !== false,
    startAt: text(row.start_at),
    endAt: text(row.end_at),
    seoTitle: text(row.seo_title),
    seoDescription: text(row.seo_description),
    publishedAt: text(row.published_at),
    updatedAt: text(row.updated_at) ?? new Date(0).toISOString(),
  };
}

function withinWindow(startAt: string | null, endAt: string | null, now = Date.now()): boolean {
  if (startAt && new Date(startAt).getTime() > now) return false;
  if (endAt && new Date(endAt).getTime() < now) return false;
  return true;
}

/** All live offers (published, active, inside their schedule), ordered for display. */
export const getLiveOffers = unstable_cache(
  async (): Promise<Offer[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("status", "published")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(50);
      if (error || !data) return [];
      return (data as Row[])
        .map(toOffer)
        .filter((offer): offer is Offer => offer !== null)
        .filter((offer) => withinWindow(offer.startAt, offer.endAt));
    } catch {
      return [];
    }
  },
  ["offers-live"],
  { tags: ["offers"], revalidate: 300 },
);

export async function getOfferBySlug(slug: string): Promise<Offer | null> {
  const offers = await getLiveOffers();
  return offers.find((offer) => offer.slug === slug) ?? null;
}

/** Highest-priority popup offer (one at a time). */
export async function getPopupOffer(): Promise<Offer | null> {
  const offers = await getLiveOffers();
  const candidates = offers.filter((offer) => offer.popupEnabled);
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.popupPriority - a.popupPriority)[0] ?? null;
}

export const getLiveAnnouncements = unstable_cache(
  async (): Promise<Announcement[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("status", "published")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("priority", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(100);
      if (error || !data) return [];
      return (data as Row[])
        .map(toAnnouncement)
        .filter((item): item is Announcement => item !== null)
        .filter((item) => withinWindow(item.startAt, item.endAt));
    } catch {
      return [];
    }
  },
  ["announcements-live"],
  { tags: ["announcements"], revalidate: 300 },
);

export async function getAnnouncementBySlug(slug: string): Promise<Announcement | null> {
  const items = await getLiveAnnouncements();
  return items.find((item) => item.slug === slug) ?? null;
}

/** Top-bar announcement: highest priority item positioned for the top bar. */
export async function getTopBarAnnouncement(): Promise<Announcement | null> {
  const items = await getLiveAnnouncements();
  return items.find((item) => item.displayPosition === "top_bar") ?? null;
}

export const getLaunchBenefits = unstable_cache(
  async (): Promise<LaunchBenefit[]> => {
    if (!isSupabaseConfigured) return FALLBACK_BENEFITS;
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("launch_benefits")
        .select("id, title, description, icon")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(12);
      if (error) return FALLBACK_BENEFITS;
      if (!data || data.length === 0) return [];
      return (data as Row[])
        .map((row) => {
          const title = text(row.title);
          return title
            ? { id: String(row.id), title, description: text(row.description), icon: text(row.icon) }
            : null;
        })
        .filter((item): item is LaunchBenefit => item !== null);
    } catch {
      return FALLBACK_BENEFITS;
    }
  },
  ["launch-benefits"],
  { tags: ["launch-benefits"], revalidate: 300 },
);

export const getSocialLinks = unstable_cache(
  async (): Promise<SocialLinkItem[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("social_links")
        .select("id, platform, label, url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(20);
      if (error || !data) return [];
      return (data as Row[])
        .map((row) => {
          const platform = text(row.platform);
          const url = text(row.url);
          if (!platform || !url || !SOCIAL_PLATFORMS.includes(platform as SocialPlatform)) {
            return null;
          }
          try {
            if (new URL(url).protocol !== "https:") return null;
          } catch {
            return null;
          }
          return {
            id: String(row.id),
            platform: platform as SocialPlatform,
            label: text(row.label) ?? platform,
            url,
          };
        })
        .filter((item): item is SocialLinkItem => item !== null);
    } catch {
      return [];
    }
  },
  ["social-links"],
  { tags: ["social-links"], revalidate: 300 },
);

export async function getOfferSitemapEntries(): Promise<{ slug: string; updatedAt: string }[]> {
  const offers = await getLiveOffers();
  return offers.map((offer) => ({ slug: offer.slug, updatedAt: offer.updatedAt }));
}

export async function getUpdateSitemapEntries(): Promise<{ slug: string; updatedAt: string }[]> {
  const items = await getLiveAnnouncements();
  return items.map((item) => ({ slug: item.slug, updatedAt: item.updatedAt }));
}

export function formatInr(value: number | null): string | null {
  if (value === null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
