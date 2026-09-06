import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FOOTER_LINK_GROUPS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import type { SiteSettings } from "@/lib/data/settings";
import type { PublicNavLink } from "@/lib/data/navigation";

export function Footer({
  settings,
  managedLinks = [],
}: {
  settings?: SiteSettings | null;
  managedLinks?: readonly PublicNavLink[];
}) {
  const linkGroups = managedLinks.length
    ? [
        { title: "Explore", links: managedLinks },
        ...FOOTER_LINK_GROUPS.slice(1),
      ]
    : FOOTER_LINK_GROUPS;
  const brandName = settings?.brandName || BRAND.primaryName;
  const brandShortName = settings?.brandShortName || BRAND.shortName;
  const tagline = settings?.tagline || BRAND.tagline;

  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-surface">
      {/* Top brand gradient hairline */}
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      {/* Ambient background texture */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden="true"
        className="aurora aurora-a -left-32 top-10 -z-10 hidden h-80 w-80 lg:block"
      />
      <div
        aria-hidden="true"
        className="aurora aurora-b -right-24 bottom-0 -z-10 hidden h-72 w-72 lg:block"
      />

      <div className="mx-auto w-full max-w-content px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-2.5 rounded-full focus-ring">
              <span
                aria-hidden="true"
                className="icon-bead h-9 w-9 !rounded-[11px] text-xs font-bold transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-105"
              >
                AJ
              </span>
              <p className="text-base font-semibold tracking-tight text-ink">{brandName}</p>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {tagline} Custom software, SaaS platforms, web and mobile apps, desktop software
              and industry-specific business systems.
            </p>
            <p className="mt-3 text-xs text-ink-muted">Also known as {brandShortName}.</p>

            <Link
              href="/request-quote"
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-gradient-to-b from-surface to-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 shadow-e1 transition-[transform,box-shadow] duration-200 ease-soft hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] focus-ring dark:from-brand-100 dark:to-brand-50 dark:text-brand-400"
            >
              Start a project
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 ease-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>

            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {settings.socialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.1em] text-ink">
                {group.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 rounded-sm text-sm text-ink-muted transition-[color,transform] duration-200 ease-soft hover:translate-x-0.5 hover:text-brand-600 focus-ring dark:hover:text-brand-400"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-brand-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="relative inline-flex h-2 w-2 items-center justify-center"
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            {tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
