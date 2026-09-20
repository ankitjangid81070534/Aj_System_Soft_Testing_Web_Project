"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Menu, User, X } from "lucide-react";
import type { PublicNavLink } from "@/lib/data/navigation";
import type { ServiceCardModel } from "@/lib/data/services";
import { NAV_LINKS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import { isNavigationActive } from "@/lib/bottom-navigation";
import { renderIcon } from "@/components/site/icons";
import { PortalLoginModal } from "@/components/portal/PortalLoginModal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./site-header.module.css";

/**
 * Site-wide header in the approved Juspay-style presentation: a floating dark
 * pill with the CMS navigation links, a services hover panel, Client Login and
 * the settings-driven CTA. Below 1024px it becomes a compact bar with a
 * full-screen drawer, so mobile has one predictable navigation surface.
 *
 * Existing behaviour is unchanged: the same CMS links, the same portal/session
 * logic (account when signed in, login modal otherwise) and the same CTA.
 */
export function SiteHeader({
  navLinks = NAV_LINKS,
  services = [],
  brandName = BRAND.primaryName,
  brandShortName = BRAND.shortName,
  ctaLabel = "Start Project",
  ctaHref = "/request-quote",
}: {
  navLinks?: readonly PublicNavLink[];
  services?: ServiceCardModel[];
  brandName?: string;
  brandShortName?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const safeCtaLabel = ctaLabel?.trim() ? ctaLabel.trim() : "Start Project";
  const safeCtaHref = ctaHref?.trim() ? ctaHref.trim() : "/request-quote";
  const safeBrandName = brandName?.trim() ? brandName.trim() : BRAND.primaryName;
  const safeBrandShortName = brandShortName?.trim() ? brandShortName.trim() : BRAND.shortName;
  const links = navLinks.filter((link) => link.href !== "/");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const closeTimer = useRef<number | null>(null);

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

  // Route change must never leave the drawer or hover panel open.
  useEffect(() => {
    setDrawerOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [drawerOpen]);

  async function openPortal() {
    setDrawerOpen(false);
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

  const showServices = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const hideServices = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 140);
  };

  const portalLabel = authenticated ? "Open Account" : "Client Login";
  const portalDisclosure = authenticated
    ? {}
    : {
        "aria-haspopup": "dialog" as const,
        "aria-expanded": portalOpen,
        "aria-controls": portalOpen ? "portal-login-dialog" : undefined,
      };

  return (
    <header className={styles.band} data-site-nav>
      <ScrollProgress />
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label={`${safeBrandName} — home`}>
          <span className={styles.mark} aria-hidden="true">
            AJ
          </span>
          <span className={styles.brandName}>{safeBrandName}</span>
        </Link>

        <nav className={styles.links} aria-label="Main">
          {links.map((link) => {
            const current = isNavigationActive(pathname, link.href);
            if (link.href === "/services" && services.length > 0) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.link} ${servicesOpen ? styles.linkActive : ""}`}
                  aria-current={current ? "page" : undefined}
                  aria-expanded={servicesOpen}
                  onMouseEnter={showServices}
                  onFocus={showServices}
                  onMouseLeave={hideServices}
                  onBlur={hideServices}
                >
                  {link.label}
                  <ChevronDown size={15} aria-hidden="true" />
                </Link>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={styles.link}
                aria-current={current ? "page" : undefined}
                onMouseEnter={hideServices}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.login} onClick={() => void openPortal()} {...portalDisclosure}>
            <User size={16} aria-hidden="true" />
            {portalLabel}
          </button>
          <Link href={safeCtaHref} className={styles.cta}>
            {safeCtaLabel}
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={styles.burger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="site-navigation-drawer"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>

        {servicesOpen && services.length > 0 ? (
          <div className={styles.mega} onMouseEnter={showServices} onMouseLeave={hideServices}>
            {services.slice(0, 8).map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`} className={styles.megaRow}>
                <span className={styles.megaIcon} aria-hidden="true">
                  {renderIcon(service.icon)}
                </span>
                <span>
                  <strong>{service.name}</strong>
                  <small>{service.shortDescription}</small>
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {drawerOpen ? (
        <div className={styles.drawer} id="site-navigation-drawer" role="dialog" aria-modal="true" aria-label={`${safeBrandName} navigation`}>
          <div className={styles.drawerHead}>
            <Link href="/" className={styles.brand} onClick={() => setDrawerOpen(false)}>
              <span className={styles.mark} aria-hidden="true">
                AJ
              </span>
              <span className={styles.brandName}>{safeBrandShortName}</span>
            </Link>
            <button type="button" className={styles.close} onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu" autoFocus>
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <p className={styles.drawerLabel}>Pages</p>
          <div className={styles.drawerLinks}>
            <Link href="/" className={styles.drawerLink} aria-current={pathname === "/" ? "page" : undefined} onClick={() => setDrawerOpen(false)}>
              Home <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.drawerLink}
                aria-current={isNavigationActive(pathname, link.href) ? "page" : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                {link.label} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>

          {services.length > 0 ? (
            <>
              <p className={styles.drawerLabel}>Services</p>
              <div className={styles.drawerLinks}>
                {services.slice(0, 6).map((service) => (
                  <Link key={service.id} href={`/services/${service.slug}`} className={styles.drawerLink} onClick={() => setDrawerOpen(false)}>
                    {service.name} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </>
          ) : null}

          <div className={styles.drawerActions}>
            <Link href={safeCtaHref} className={styles.drawerCta} onClick={() => setDrawerOpen(false)}>
              {safeCtaLabel}
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            <button type="button" className={styles.drawerLogin} onClick={() => void openPortal()} {...portalDisclosure}>
              <User size={18} aria-hidden="true" />
              {portalLabel}
            </button>
          </div>
        </div>
      ) : null}

      {portalOpen ? <PortalLoginModal onClose={() => setPortalOpen(false)} /> : null}
    </header>
  );
}
