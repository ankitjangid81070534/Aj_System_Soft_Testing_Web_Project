/**
 * Brand identity constants — single source of truth across the site.
 * Spelling rule: always "Technology".
 */
export const BRAND = {
  primaryName: "AJ System Soft Technology",
  shortName: "AJS Technology",
  alternateNames: ["Ankit Jangid System Technology", "Ankit System Technology"],
  tagline: "Software built around your requirements.",
  description:
    "AJ System Soft Technology designs and builds custom software, SaaS platforms, websites, web and mobile apps, desktop software and industry-specific business systems such as ERP, CRM, POS and hospital software — built around each client's requirements.",
  /** Open Graph locale. The company serves India first, then worldwide. */
  locale: "en_IN",
  /** Founder / primary contact — used for Organization and author entities. */
  founderName: "Ankit Jangid",
  /** ISO 3166-1 alpha-2 for the primary market. */
  countryCode: "IN",
  areaServed: ["India", "Worldwide"] as const,
} as const;

/**
 * Site-wide topical keywords for the `<meta name="keywords">` tag and
 * `Organization.knowsAbout`. This is the curated head of the 5,000-keyword
 * research set (docs/seo/keyword-map.md) — one clean phrase per cluster.
 * Never paste the long-tail variants here: Google ignores keyword stuffing
 * and it can trip AdSense's low-value-content review.
 */
export const SITE_KEYWORDS = [
  "AJ System Soft Technology",
  "AJS Technology",
  "custom software development company India",
  "software development company India",
  "SaaS development company India",
  "web application development company India",
  "website development company India",
  "ecommerce website development India",
  "Android app development company India",
  "iOS app development company India",
  "desktop software development India",
  "ERP software development company India",
  "CRM software development India",
  "hospital management software India",
  "clinic management software",
  "pharmacy software development",
  "retail POS software India",
  "inventory management software",
  "hotel management software",
  "API integration services India",
  "business automation software",
  "Next.js development company",
  "Supabase development",
] as const;

/** Service catalogue used for structured data (mirrors public service pages). */
export const SERVICE_TYPES = [
  "Custom Software Development",
  "SaaS Development",
  "Web Application Development",
  "Website Development",
  "Ecommerce Development",
  "Android App Development",
  "iOS App Development",
  "Desktop Software Development",
  "ERP, CRM & Business Software",
  "Hospital & Clinic Software",
  "Pharmacy Software",
  "Retail POS & Inventory Software",
  "Hotel Management Software",
  "API & System Integrations",
  "Cloud Deployment & Maintenance",
] as const;
