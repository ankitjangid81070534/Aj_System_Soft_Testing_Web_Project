import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * Editable website copy (migration 0018, table `public.site_copy`).
 *
 * Every string below is the text the public site shows today. The admin
 * (/ajadmin/copy) saves an override per key; the reader merges saved values over
 * these defaults, so:
 *   * nothing changes until an admin edits a field,
 *   * a blank/absent row falls back to the default (the site can never go empty),
 *   * `{brand}` / `{shortBrand}` are replaced with the brand names from
 *     "Brand & settings", so renaming the company still only needs one edit.
 *
 * `kind` only drives the admin input: text = one line, long = textarea,
 * list = one item per line.
 */
export type CopyFieldKind = "text" | "long" | "list";

export type CopyField = {
  key: string;
  label: string;
  group: string;
  value: string;
  kind?: CopyFieldKind;
};

const HERO = "Hero";
const DASHBOARD = "Live product preview";
const CASE_STUDIES = "Case studies";
const TRUST = "Trusted by";
const ROUTING = "One team, every platform";
const TRIAD = "Launch benefits";
const WORLD = "Ownership";
const SERVICES = "Services";
const STACK = "Technology";
const WHY = "Why us";
const JOURNEY = "How we work";
const INDUSTRIES = "Industries";
const PACKAGES = "Packages";
const GALLERY = "Portfolio";
const PROOF = "Reviews, team & blog";
const CTA = "Final call to action";

export const SITE_COPY_FIELDS: readonly CopyField[] = [
  // ---------------------------------------------------------------- hero
  { key: "home.hero.eyebrow", label: "Eyebrow", group: HERO, value: "{brand} — software development" },
  { key: "home.hero.titleAccent", label: "Title — coloured word", group: HERO, value: "Software" },
  { key: "home.hero.titleRest", label: "Title — rest of the line", group: HERO, value: "built around your requirements." },
  {
    key: "home.hero.lead",
    label: "Lead paragraph",
    group: HERO,
    kind: "long",
    value:
      "Custom software, web platforms, SaaS, Android & iOS apps and business automation systems — engineered around your workflows, from first mockup to launch.",
  },
  { key: "home.hero.secondaryCta", label: "Second button label", group: HERO, value: "Explore Projects" },
  {
    key: "home.hero.points",
    label: "Delivery points (one per line)",
    group: HERO,
    kind: "list",
    value: "Requirements-first delivery\nYou own the source code\nSupport after launch",
  },
  {
    key: "home.hero.tags",
    label: "Service tags (one per line)",
    group: HERO,
    kind: "list",
    value:
      "Websites & web apps\nDesktop software\nERP / CRM / POS\nIndustry software\nAPI integrations",
  },
  { key: "home.heroProof.trustedLabel", label: "Logo strip label", group: HERO, value: "Trusted by" },

  // ------------------------------------------------------ live dashboard
  { key: "home.dashboard.eyebrow", label: "Eyebrow", group: DASHBOARD, value: "Live product preview" },
  { key: "home.dashboard.title", label: "Title", group: DASHBOARD, value: "See your business data," },
  { key: "home.dashboard.titleAccent", label: "Title — coloured word", group: DASHBOARD, value: "live" },
  {
    key: "home.dashboard.lead",
    label: "Lead paragraph",
    group: DASHBOARD,
    kind: "long",
    value:
      "This is the kind of dashboard your team opens every morning — switch between billing, inventory and payments to see how real numbers turn into clear decisions.",
  },

  // --------------------------------------------------------- case studies
  { key: "home.caseStudies.eyebrow", label: "Eyebrow", group: CASE_STUDIES, value: "Case studies" },
  { key: "home.caseStudies.title", label: "Title", group: CASE_STUDIES, value: "Real problems," },
  { key: "home.caseStudies.titleAccent", label: "Title — coloured words", group: CASE_STUDIES, value: "measured results" },
  {
    key: "home.caseStudies.lead",
    label: "Lead paragraph",
    group: CASE_STUDIES,
    kind: "long",
    value: "What changed for businesses after their software went live — in their numbers, not ours.",
  },

  // ---------------------------------------------------------------- trust
  { key: "home.trust.eyebrow", label: "Eyebrow", group: TRUST, value: "Trusted by" },
  { key: "home.trust.title", label: "Title", group: TRUST, value: "Businesses already running on" },
  { key: "home.trust.titleAccent", label: "Title — coloured words", group: TRUST, value: "our software" },

  // -------------------------------------------------------------- routing
  { key: "home.routing.title", label: "Title", group: ROUTING, value: "One team," },
  { key: "home.routing.titleAccent", label: "Title — coloured words", group: ROUTING, value: "every platform" },
  {
    key: "home.routing.lead",
    label: "Lead paragraph",
    group: ROUTING,
    kind: "long",
    value:
      "Tell us the problem — we propose the right platform and architecture for it, not the other way around.",
  },

  // ---------------------------------------------------------------- triad
  { key: "home.triad.eyebrow", label: "Eyebrow", group: TRIAD, value: "Launch benefits" },
  { key: "home.triad.title", label: "Title", group: TRIAD, value: "What’s included with" },
  { key: "home.triad.titleAccent", label: "Title — coloured words", group: TRIAD, value: "every project" },
  {
    key: "home.triad.lead",
    label: "Lead paragraph",
    group: TRIAD,
    kind: "long",
    value:
      "Our service goes beyond just writing code. Every custom software project includes these benefits by default.",
  },

  // ---------------------------------------------------------------- world
  { key: "home.world.title", label: "Title — first line", group: WORLD, value: "You own your" },
  { key: "home.world.titleAccent", label: "Title — coloured word", group: WORLD, value: "software" },
  { key: "home.world.titleLine2", label: "Title — second line", group: WORLD, value: "We help it grow." },
  {
    key: "home.world.lead",
    label: "Lead paragraph",
    group: WORLD,
    kind: "long",
    value:
      "Source code and documentation handed over with the build. Ongoing care after launch — updates, fixes and improvements. Software for the way your industry works, built for web, mobile and desktop.",
  },

  // ------------------------------------------------------------- services
  { key: "home.services.eyebrow", label: "Eyebrow", group: SERVICES, value: "Services" },
  { key: "home.services.title", label: "Title", group: SERVICES, value: "What we can" },
  { key: "home.services.titleAccent", label: "Title — coloured words", group: SERVICES, value: "build for you" },
  {
    key: "home.services.lead",
    label: "Lead paragraph",
    group: SERVICES,
    kind: "long",
    value:
      "From a single business tool to a complete platform — every engagement starts with your requirements and ends with working software.",
  },
  { key: "home.services.allLabel", label: "Button label", group: SERVICES, value: "Explore all services" },

  // ---------------------------------------------------------------- stack
  { key: "home.stack.eyebrow", label: "Eyebrow", group: STACK, value: "Technology" },
  { key: "home.stack.title", label: "Title", group: STACK, value: "A modern," },
  { key: "home.stack.titleAccent", label: "Title — coloured words", group: STACK, value: "maintainable stack" },
  {
    key: "home.stack.lead",
    label: "Lead paragraph",
    group: STACK,
    kind: "long",
    value: "We choose proven technology per project — here is what we commonly work with.",
  },

  // --------------------------------------------------------------- why us
  { key: "home.why.eyebrow", label: "Eyebrow", group: WHY, value: "Why {shortBrand}" },
  { key: "home.why.title", label: "Title", group: WHY, value: "Why teams choose" },
  {
    key: "home.why.lead",
    label: "Lead paragraph",
    group: WHY,
    kind: "long",
    value: "A focused development partner that treats your requirements as the specification.",
  },

  // -------------------------------------------------------------- journey
  { key: "home.journey.eyebrow", label: "Eyebrow", group: JOURNEY, value: "How we work" },
  {
    key: "home.journey.title",
    label: "Title",
    group: JOURNEY,
    value: "From your requirement to a paid, live product",
  },
  {
    key: "home.journey.lead",
    label: "Lead paragraph",
    group: JOURNEY,
    kind: "long",
    value:
      "{shortBrand} builds software exactly the way each customer needs it — secure infrastructure, a real conversation about your requirement, a website or app shipped to your brand, and a clean checkout your customers can trust.",
  },

  // ----------------------------------------------------------- industries
  { key: "home.industries.eyebrow", label: "Eyebrow", group: INDUSTRIES, value: "Industries" },
  { key: "home.industries.title", label: "Title", group: INDUSTRIES, value: "Software for the way your" },
  { key: "home.industries.titleAccent", label: "Title — coloured words", group: INDUSTRIES, value: "industry works" },
  {
    key: "home.industries.lead",
    label: "Lead paragraph",
    group: INDUSTRIES,
    kind: "long",
    value: "Every trade has its own rules, documents and workflows. We build around them.",
  },

  // ------------------------------------------------------------- packages
  { key: "home.packages.eyebrow", label: "Eyebrow", group: PACKAGES, value: "Packages" },
  { key: "home.packages.title", label: "Title", group: PACKAGES, value: "Pick a starting point," },
  { key: "home.packages.titleAccent", label: "Title — coloured words", group: PACKAGES, value: "pay by milestone" },
  {
    key: "home.packages.lead",
    label: "Lead paragraph",
    group: PACKAGES,
    kind: "long",
    value:
      "Every package includes source-code ownership. Final scope and price are confirmed after a free requirement call.",
  },

  // -------------------------------------------------------------- gallery
  { key: "home.gallery.eyebrow", label: "Eyebrow", group: GALLERY, value: "Portfolio" },
  { key: "home.gallery.title", label: "Title", group: GALLERY, value: "Real work," },
  { key: "home.gallery.titleAccent", label: "Title — coloured word", group: GALLERY, value: "delivered" },
  {
    key: "home.gallery.lead",
    label: "Lead paragraph",
    group: GALLERY,
    kind: "long",
    value:
      "A selection of the platforms, apps and business systems we have shipped for clients — each one built around their exact requirements.",
  },

  // ---------------------------------------------------------------- proof
  { key: "home.reviews.eyebrow", label: "Reviews eyebrow", group: PROOF, value: "Verified reviews" },
  { key: "home.reviews.title", label: "Reviews title", group: PROOF, value: "What clients" },
  { key: "home.reviews.titleAccent", label: "Reviews title — coloured word", group: PROOF, value: "say" },
  { key: "home.team.eyebrow", label: "Team eyebrow", group: PROOF, value: "Team" },
  { key: "home.team.title", label: "Team title", group: PROOF, value: "The people who" },
  { key: "home.team.titleAccent", label: "Team title — coloured words", group: PROOF, value: "build it" },
  { key: "home.blog.eyebrow", label: "Blog eyebrow", group: PROOF, value: "Blog & insights" },
  { key: "home.blog.title", label: "Blog title", group: PROOF, value: "Latest" },
  { key: "home.blog.titleAccent", label: "Blog title — coloured word", group: PROOF, value: "articles" },

  // ------------------------------------------------------------------ cta
  { key: "home.cta.eyebrow", label: "Eyebrow", group: CTA, value: "Start a project" },
  { key: "home.cta.titleLine1", label: "Title — first line", group: CTA, value: "Ready to build software around" },
  { key: "home.cta.titleLine2", label: "Title — second line", group: CTA, value: "your" },
  { key: "home.cta.titleAccent", label: "Title — coloured word", group: CTA, value: "requirements" },
  {
    key: "home.cta.lead",
    label: "Lead paragraph",
    group: CTA,
    kind: "long",
    value:
      "Tell us what you need — we will propose the right platform, a clear plan and a transparent estimate.",
  },
  { key: "home.cta.secondaryLabel", label: "Second button label", group: CTA, value: "Request a Consultation" },
];

export const SITE_COPY_GROUPS: readonly string[] = [
  ...new Set(SITE_COPY_FIELDS.map((field) => field.group)),
];

export const SITE_COPY_DEFAULTS: Readonly<Record<string, string>> = Object.fromEntries(
  SITE_COPY_FIELDS.map((field) => [field.key, field.value]),
);

export type SiteCopyOverrides = Record<string, string>;

export type SiteCopyVars = { brand?: string; shortBrand?: string };

export type SiteCopy = {
  /** Resolved single text value for a key. */
  t: (key: string) => string;
  /** Resolved value split into a list (one item per line). */
  list: (key: string) => string[];
};

function applyVars(value: string, vars: SiteCopyVars): string {
  return value
    .replaceAll("{brand}", vars.brand ?? "AJ System Soft Technology")
    .replaceAll("{shortBrand}", vars.shortBrand ?? "AJS Technology");
}

/** Builds the copy accessor used by the public components. */
export function createSiteCopy(
  overrides: SiteCopyOverrides = {},
  vars: SiteCopyVars = {},
): SiteCopy {
  const resolve = (key: string): string => {
    const saved = overrides[key];
    const raw = typeof saved === "string" && saved.trim() !== "" ? saved : SITE_COPY_DEFAULTS[key] ?? "";
    return applyVars(raw, vars);
  };
  return {
    t: (key) => resolve(key).trim(),
    list: (key) =>
      resolve(key)
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== ""),
  };
}

/**
 * Saved overrides only (public, anon-readable). Returns an empty object when
 * Supabase is not configured or the table does not exist yet, so the site keeps
 * rendering its built-in copy.
 */
export const getSiteCopyOverrides = unstable_cache(
  async (): Promise<SiteCopyOverrides> => {
    if (!isSupabaseConfigured) return {};
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase.from("site_copy").select("key, value");
      if (error || !data) return {};
      const overrides: SiteCopyOverrides = {};
      for (const row of data) {
        if (typeof row.key === "string" && typeof row.value === "string") {
          overrides[row.key] = row.value;
        }
      }
      return overrides;
    } catch {
      return {};
    }
  },
  ["site-copy"],
  { tags: ["site-copy"], revalidate: 300 },
);
