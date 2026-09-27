"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, ChevronRight, User } from "lucide-react";
import type { PublicNavLink } from "@/lib/data/navigation";
import type { ServiceCardModel } from "@/lib/data/services";
import { NAV_LINKS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import { isNavigationActive } from "@/lib/bottom-navigation";
import { renderIcon } from "@/components/site/icons";
import { PortalLoginModal } from "@/components/portal/PortalLoginModal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSmartHeader } from "./useSmartHeader";
import styles from "./site-header.module.css";

/**
 * Site-wide header in the approved Juspay-style presentation: a floating dark
 * pill with the CMS navigation links, a services hover panel, Client Login and
 * the settings-driven CTA. Below 1200px it becomes a compact bar with a
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
  const [drawerServicesOpen, setDrawerServicesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const closeTimer = useRef<number | null>(null);
  // Hide on scroll down, return on scroll up; never hide while a menu is open.
  const { hidden, scrolled } = useSmartHeader(drawerOpen || servicesOpen || portalOpen);

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

  // Route change must never leave the drawer or hover panel open. Reset during
  // render (React's "adjust state on prop change" pattern) instead of an effect.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (seenPathname !== pathname) {
    setSeenPathname(pathname);
    setDrawerOpen(false);
    setDrawerServicesOpen(false);
    setServicesOpen(false);
  }

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerServicesOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1200px)");
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
    <header className={styles.band} data-site-nav data-hidden={hidden || undefined} data-scrolled={scrolled || undefined}>
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
            <BurgerIcon open={drawerOpen} />
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

      {/* Portalled to <body>: the header animates with `transform`, which would
          otherwise turn the fixed drawer's containing block into the header
          itself and clip the menu to the bar's height. */}
      {drawerOpen && typeof document !== "undefined" ? createPortal(
        <div className={styles.drawer} id="site-navigation-drawer" role="dialog" aria-modal="true" aria-label={`${safeBrandName} navigation`}>
          <div className={styles.drawerHead}>
            <Link href="/" className={styles.brand} onClick={closeDrawer}>
              <span className={styles.mark} aria-hidden="true">
                AJ
              </span>
              <span className={styles.brandName}>{safeBrandShortName}</span>
            </Link>
            <button type="button" className={styles.close} onClick={closeDrawer} aria-label="Close navigation menu" autoFocus>
              <BurgerIcon open />
            </button>
          </div>

          <p className={styles.drawerLabel}>Menu</p>
          <div className={styles.drawerLinks}>
            <Link href="/" className={styles.drawerLink} aria-current={pathname === "/" ? "page" : undefined} onClick={closeDrawer}>
              Home <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {links.map((link) => {
              const current = isNavigationActive(pathname, link.href);
              // Services is a collapsible group: only the main option shows
              // until it is tapped, then its sub-services unfold beneath it.
              if (link.href === "/services" && services.length > 0) {
                return (
                  <div key={link.href} className={styles.drawerGroup} data-open={drawerServicesOpen || undefined}>
                    <button
                      type="button"
                      className={styles.drawerLink}
                      aria-current={current ? "page" : undefined}
                      aria-expanded={drawerServicesOpen}
                      aria-controls="site-drawer-services"
                      onClick={() => setDrawerServicesOpen((open) => !open)}
                    >
                      {link.label} <ChevronDown size={18} aria-hidden="true" className={styles.drawerChevron} />
                    </button>
                    <div id="site-drawer-services" className={styles.drawerSub}>
                      <div className={styles.drawerSubInner}>
                        {services.slice(0, 8).map((service) => (
                          <Link key={service.id} href={`/services/${service.slug}`} className={styles.drawerSubLink} onClick={closeDrawer}>
                            <span className={styles.drawerSubIcon} aria-hidden="true">
                              {renderIcon(service.icon)}
                            </span>
                            {service.name}
                          </Link>
                        ))}
                        <Link href={link.href} className={`${styles.drawerSubLink} ${styles.drawerSubAll}`} onClick={closeDrawer}>
                          All services <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.drawerLink}
                  aria-current={current ? "page" : undefined}
                  onClick={closeDrawer}
                >
                  {link.label} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          <div className={styles.drawerActions}>
            <Link href={safeCtaHref} className={styles.drawerCta} onClick={closeDrawer}>
              {safeCtaLabel}
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            <button type="button" className={styles.drawerLogin} onClick={() => void openPortal()} {...portalDisclosure}>
              <User size={18} aria-hidden="true" />
              {portalLabel}
            </button>
          </div>
        </div>,
        document.body,
      ) : null}

      {portalOpen ? <PortalLoginModal onClose={() => setPortalOpen(false)} /> : null}
    </header>
  );
}

/** Three-line menu glyph that morphs into a cross (juspay.io-style). */
function BurgerIcon({ open = false }: { open?: boolean }) {
  return (
    <span className={styles.burgerIcon} data-open={open || undefined} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
