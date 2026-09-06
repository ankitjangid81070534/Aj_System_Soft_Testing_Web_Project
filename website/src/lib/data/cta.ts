/**
 * Pure helpers for the global call-to-action stored in `site_settings`.
 * Kept free of Next.js imports so they are unit-testable and safe to use from
 * both server and client components.
 *
 * Defaults mirror the DB column defaults (migration 0002_site_config.sql).
 */
export const DEFAULT_CTA_LABEL = "Start Your Project";
export const DEFAULT_CTA_HREF = "/request-quote";

export function textOrDefault(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

/** Internal hrefs must start with "/"; external ones must be https URLs. */
export function ctaHrefOrDefault(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_CTA_HREF;
  const href = value.trim();
  if (href.startsWith("/") || /^https:\/\//i.test(href)) return href;
  return DEFAULT_CTA_HREF;
}

/**
 * A blank or whitespace-only admin value must never reach the UI: an empty
 * header CTA renders as an unlabelled pill and breaks the header layout.
 */
export function sanitizeCta(label: unknown, href: unknown): { label: string; href: string } {
  return { label: textOrDefault(label, DEFAULT_CTA_LABEL), href: ctaHrefOrDefault(href) };
}
