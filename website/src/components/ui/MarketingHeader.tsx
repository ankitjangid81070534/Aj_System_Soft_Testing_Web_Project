"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PortalLoginModal } from "@/components/portal/PortalLoginModal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PublicNavLink } from "@/lib/data/navigation";

/**
 * Lightweight floating header with soft-3D depth and no scroll-driven state,
 * keeping mobile navigation stable and responsive.
 */
export function MarketingHeader({
  navLinks = NAV_LINKS,
  brandName = BRAND.primaryName,
  brandShortName = BRAND.shortName,
  ctaLabel = "Start Project",
  ctaHref = "/request-quote",
}: {
  navLinks?: readonly PublicNavLink[];
  brandName?: string;
  brandShortName?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Defensive: settings-driven props may arrive blank from the CMS. A blank
  // CTA label used to render an empty pill next to the Portal button.
  const safeCtaLabel = ctaLabel?.trim() ? ctaLabel.trim() : "Start Project";
  const safeCtaHref = ctaHref?.trim() ? ctaHref.trim() : "/request-quote";
  const safeBrandName = brandName?.trim() ? brandName.trim() : BRAND.primaryName;
  const safeBrandShortName = brandShortName?.trim() ? brandShortName.trim() : BRAND.shortName;
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    try {
      const supabase = createSupabaseBrowserClient();
      void supabase.auth.getSession().then(({ data }) => {
        if (active) setAuthenticated(Boolean(data.session));
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setAuthenticated(Boolean(session));
          if (session) setPortalOpen(false);
        }
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch {
      return () => {
        active = false;
      };
    }
  }, []);

  async function openPortal() {
    setMenuOpen(false);
    let hasSession = authenticated;
    if (!hasSession) {
      try {
        const { data } = await createSupabaseBrowserClient().auth.getSession();
        hasSession = Boolean(data.session);
        setAuthenticated(hasSession);
      } catch {
        hasSession = false;
      }
    }
    if (hasSession) {
      router.push("/account");
      return;
    }
    window.setTimeout(() => setPortalOpen(true), 0);
  }

  return (
    <header className="sticky top-0 z-40">
      <ScrollProgress />
      <div className="mx-auto w-full max-w-content px-4 pt-3 sm:px-6">
        <div className="glass-strong flex items-center justify-between gap-2 rounded-full px-3 py-2 shadow-[0_1px_2px_rgb(15_23_42/0.05),0_12px_32px_rgb(15_23_42/0.10),inset_0_1px_0_rgb(255_255_255/0.9)] sm:px-5 dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_12px_32px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.08)]">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-full px-1 py-0.5 focus-ring"
            aria-label={`${safeBrandName} — home`}
          >
            <span
              aria-hidden="true"
              className="icon-bead h-8 w-8 !rounded-[10px] text-xs font-bold transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-105"
            >
              AJ
            </span>
            {/* Full name where there is room (≤md and ≥xl); short name at lg where
                the 7-link nav, Portal and CTA share one row. */}
            <span className="hidden whitespace-nowrap font-brand text-sm font-semibold tracking-tight text-ink sm:inline lg:hidden xl:inline">
              {safeBrandName}
            </span>
            <span className="whitespace-nowrap font-brand text-sm font-semibold tracking-tight text-ink sm:hidden lg:inline xl:hidden">
              {safeBrandShortName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden min-w-0 lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative whitespace-nowrap rounded-full border border-transparent px-2.5 py-1.5 text-[13px] font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-soft focus-ring xl:px-3.5",
                        active
                          ? "border-brand-100 bg-gradient-to-b from-surface to-brand-50 font-semibold text-brand-700 shadow-[0_3px_10px_rgb(37_87_232/0.12),inset_0_1px_0_rgb(255_255_255/0.9)] dark:border-brand-200 dark:from-brand-100 dark:to-brand-50 dark:text-brand-400 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                          : "text-ink-muted hover:-translate-y-px hover:border-line hover:bg-canvas-raised hover:text-ink hover:shadow-xs",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions: ThemeToggle, Client Portal, Primary CTA */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            {/* Client Portal — icon-only pill on lg, labelled pill on xl+ */}
            <button
              type="button"
              onClick={() => void openPortal()}
              aria-label={authenticated ? "Open your account" : "Client portal login"}
              title={authenticated ? "Open your account" : "Client Portal & Account"}
              className="hidden h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-xs font-medium leading-none text-ink-muted shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_3px_10px_rgb(15_23_42/0.05)] transition-[color,border-color,box-shadow,transform] duration-200 ease-soft hover:-translate-y-px hover:border-brand-200 hover:text-ink hover:shadow-e2 focus-ring lg:inline-flex xl:px-3.5 dark:shadow-none"
            >
              <User aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="hidden whitespace-nowrap xl:inline">
                {authenticated ? "Account" : "Portal"}
              </span>
            </button>

            {/* Primary CTA — never renders without a label */}
            <span className="hidden shrink-0 sm:inline-flex">
              <Button href={safeCtaHref} size="sm">
                {safeCtaLabel}
              </Button>
            </span>

            {/* Mobile Menu Toggle Button */}
            <IconButton
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              size="sm"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPortal={() => void openPortal()}
        portalAuthenticated={authenticated}
        navLinks={navLinks}
        brandName={safeBrandName}
        ctaLabel={safeCtaLabel}
        ctaHref={safeCtaHref}
      />
      {portalOpen ? <PortalLoginModal onClose={() => setPortalOpen(false)} /> : null}
    </header>
  );
}
