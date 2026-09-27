"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, ChevronRight, FolderKanban, User } from "lucide-react";
import type { PublicNavLink } from "@/lib/data/navigation";
import type { ServiceCardModel } from "@/lib/data/services";
import type { ProjectTeaser } from "@/lib/data/mappers";
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
  projects = [],
  brandName = BRAND.primaryName,
  brandShortName = BRAND.shortName,
  ctaLabel = "Start Project",
  ctaHref = "/request-quote",
}: {
  navLinks?: readonly PublicNavLink[];
  services?: ServiceCardModel[];
  projects?: Pick<ProjectTeaser, "id" | "slug" | "name" | "summary" | "coverUrl">[];
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

  // Nav links that open a hover list (desktop) / collapsible group (drawer).
  const menus: Record<string, { allLabel: string; items: MenuItem[] }> = {
    "/services": {
      allLabel: "All services",
      items: services.slice(0, 8).map((service) => ({
        id: service.id,
        href: `/services/${service.slug}`,
        title: service.name,
        subtitle: service.shortDescription,
        icon: renderIcon(service.icon),
      })),
    },
    "/projects": {
      allLabel: "All projects",
      items: projects.slice(0, 8).map((project) => ({
        id: project.id,
        href: `/projects/${project.slug}`,
        title: project.name,
        subtitle: project.summary,
        icon: project.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverUrl} alt="" className={styles.megaThumb} loading="lazy" />
        ) : (
          <FolderKanban size={18} />
        ),
      })),
    },
  };
  const menuFor = (href: string) => (menus[href]?.items.length ? menus[href] : null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMenu, setDrawerMenu] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const closeTimer = useRef<number | null>(null);
  // Hide on scroll down, return on scroll up; never hide while a menu is open.
  const { hidden, scrolled } = useSmartHeader(drawerOpen || openMenu !== null || portalOpen);

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
    setDrawerMenu(null);
    setOpenMenu(null);
  }

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMenu(null);
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

  const showMenu = (href: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(href);
  };
  const hideMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };
  const activeMenu = openMenu ? menuFor(openMenu) : null;

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
            if (menuFor(link.href)) {
              const open = openMenu === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.link} ${open ? styles.linkActive : ""}`}
                  aria-current={current ? "page" : undefined}
                  aria-expanded={open}
                  onMouseEnter={() => showMenu(link.href)}
                  onFocus={() => showMenu(link.href)}
                  onMouseLeave={hideMenu}
                  onBlur={hideMenu}
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
                onMouseEnter={hideMenu}
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

        {openMenu && activeMenu ? (
          <div className={styles.mega} onMouseEnter={() => showMenu(openMenu)} onMouseLeave={hideMenu}>
            {activeMenu.items.map((item) => (
              <Link key={item.id} href={item.href} className={styles.megaRow}>
                <span className={styles.megaIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
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
              // Services / Projects are collapsible groups: only the main option
              // shows until it is tapped, then its items unfold beneath it.
              const menu = menuFor(link.href);
              if (menu) {
                const open = drawerMenu === link.href;
                const subId = `site-drawer-${link.href.slice(1)}`;
                return (
                  <div key={link.href} className={styles.drawerGroup} data-open={open || undefined}>
                    <button
                      type="button"
                      className={styles.drawerLink}
                      aria-current={current ? "page" : undefined}
                      aria-expanded={open}
                      aria-controls={subId}
                      onClick={() => setDrawerMenu(open ? null : link.href)}
                    >
                      {link.label} <ChevronDown size={18} aria-hidden="true" className={styles.drawerChevron} />
                    </button>
                    <div id={subId} className={styles.drawerSub}>
                      <div className={styles.drawerSubInner}>
                        {menu.items.map((item) => (
                          <Link key={item.id} href={item.href} className={styles.drawerSubLink} onClick={closeDrawer}>
                            <span className={styles.drawerSubIcon} aria-hidden="true">
                              {item.icon}
                            </span>
                            {item.title}
                          </Link>
                        ))}
                        <Link href={link.href} className={`${styles.drawerSubLink} ${styles.drawerSubAll}`} onClick={closeDrawer}>
                          {menu.allLabel} <ArrowRight size={15} aria-hidden="true" />
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

type MenuItem = { id: string; href: string; title: string; subtitle: string; icon: ReactNode };

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
