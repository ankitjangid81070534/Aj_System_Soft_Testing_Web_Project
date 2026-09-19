"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  ArrowUpRight, BriefcaseBusiness, CircleHelp, Cpu, House, Info,
  LayoutGrid, MessageCircle, Plus, Search, Sparkles, Star, User, Users, X,
} from "lucide-react";
import type { PublicNavLink } from "@/lib/data/navigation";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";
import { NavBar, type NavItem } from "./tubelight-navbar";
import { isNavigationActive, splitNavigation } from "@/lib/bottom-navigation";
import { isLegalNavigationLink, withLegalNavigation } from "@/lib/navigation";
import styles from "./bottom-navigation.module.css";
import projectEdge from "./project-edge.module.css";
import { ProjectEdge } from "./ProjectEdge";

// Native links work before hydration; dialog buttons cannot. Keep them honestly
// disabled in server HTML, then enable with React's hydration snapshot (no timer).
const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

const icons: Record<string, typeof House> = {
  "/": House, "/services": LayoutGrid, "/projects": BriefcaseBusiness,
  "/contact": MessageCircle, "/ai-methods": Cpu, "/reviews": Star,
  "/about": Info, "/team": Users,
};

export function BottomNavigation({
  navLinks, open, onOpen, onClose, onPortal, authenticated, portalOpen = false, brandName, ctaLabel, ctaHref,
}: {
  navLinks: readonly PublicNavLink[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPortal: () => void;
  authenticated: boolean;
  portalOpen?: boolean;
  brandName: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const pathname = usePathname();
  const interactive = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const portalDisclosure = authenticated ? {} : {
    "aria-haspopup": "dialog" as const,
    "aria-expanded": portalOpen,
    "aria-controls": portalOpen ? "portal-login-dialog" : undefined,
  };
  const links = withLegalNavigation(navLinks);
  const legalLinks = links.filter(link => isLegalNavigationLink(link.href));
  const desktopLinks = links.filter(link => !isLegalNavigationLink(link.href));
  const { primary, overflow } = splitNavigation(links);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const searchRequested = useRef(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => { setQuery(""); onClose(); }, [onClose, setQuery]);
  const openSearch = useCallback(() => {
    searchRequested.current = true;
    onOpen();
    if (dialogRef.current?.open) searchRef.current?.focus();
  }, [onOpen]);
  const menuLinks = query.trim()
    ? links.filter(link => link.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    : overflow;

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 48); }
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (!window.matchMedia("(min-width: 1024px)").matches ||
          (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) ||
          document.querySelector('dialog[open]:not(#more-navigation)')) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    // A layout switch must not leave focus in a now-hidden desktop search field.
    desktop.addEventListener("change", closeMenu);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeMenu);
    };
  }, [openSearch, closeMenu]);

  const moreActive = overflow.some(link => isNavigationActive(pathname, link.href)) || pathname.startsWith("/account");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const previousOverflow = document.body.style.overflow;
    const moreTrigger = moreRef.current;
    const searchTrigger = searchButtonRef.current;
    returnFocusRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement : moreTrigger;
    dialog.showModal();
    if (searchRequested.current) searchRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      searchRequested.current = false;
      // A breakpoint change can hide the opener. Restore to the visible
      // counterpart instead of leaving keyboard focus on the document body.
      const trigger = [returnFocusRef.current, moreTrigger, searchTrigger]
        .find(element => element?.isConnected && element.getClientRects().length);
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  const toNavItem = (link: PublicNavLink): NavItem => ({
    name: link.label, url: link.href, icon: icons[link.href] ?? CircleHelp,
  });
  const tubelightItems = [
    ...primary.slice(0, 2).map(toNavItem),
    { name: "More", url: "#more-navigation", icon: Plus },
    ...primary.slice(2).map(toNavItem),
  ];
  const activeUrl = moreActive ? "#more-navigation"
    : primary.find(link => isNavigationActive(pathname, link.href))?.href ?? null;

  function renderNavItem(item: NavItem, isActive: boolean, lamp: ReactNode) {
    if (item.url === "#more-navigation") {
      return (
        <button ref={moreRef} type="button" className={styles.more} onClick={onOpen} disabled={!interactive}
          aria-label="More navigation options" aria-haspopup="dialog" aria-expanded={open}
          aria-controls="more-navigation" data-active={moreActive || undefined}>
          <span className={styles.moreOrb}><Plus aria-hidden="true" strokeWidth={1.8} /></span>
          <span>More</span>
          {lamp}
        </button>
      );
    }
    const Icon = item.icon;
    return (
      <Link href={item.url} className={styles.item}
        aria-current={isActive ? "page" : undefined}>
        <Icon aria-hidden="true" strokeWidth={1.65} />
        <span>{item.name}</span>
        {lamp}
      </Link>
    );
  }

  return (
    <>
      <nav aria-label="Main" className={styles.dock} data-bottom-navigation data-scrolled={scrolled || undefined}>
        <div className={styles.dockIdentity}>
          <Link href="/" className={styles.dockBrand} aria-label={`${brandName} — home`}>
            <span className={styles.dockMark} aria-hidden="true">AJ<span /></span>
            <span className={styles.dockBrandCopy}>{brandName}<small>DESIGN. BUILD. EVOLVE.</small></span>
          </Link>
          <div className={styles.legalLinks} data-legal-navigation>
            {legalLinks.map(link => (
              <Link key={link.href} href={link.href}
                aria-current={isNavigationActive(pathname, link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <NavBar items={tubelightItems} activeUrl={activeUrl} embedded
          className={styles.linkGroup} renderItem={renderNavItem} />
        <NavBar items={desktopLinks.map(toNavItem)} embedded
          className={styles.desktopLinks} renderItem={renderNavItem} />
        <div className={styles.dockActions}>
          <button type="button" className={styles.accountTrigger} onClick={onPortal} disabled={!interactive} {...portalDisclosure}>
            <User aria-hidden="true" size={17} />{authenticated ? "Open Account" : "Client Login"}
          </button>
          <button ref={searchButtonRef} type="button" className={styles.searchTrigger} onClick={openSearch} disabled={!interactive}
            aria-label="Search navigation" title="Search pages (Ctrl K / ⌘ K)" aria-keyshortcuts="Meta+K Control+K" aria-haspopup="dialog" aria-controls="more-navigation" aria-expanded={open}>
            <Search aria-hidden="true" size={19} /><kbd>⌘ K</kbd>
          </button>
          <Link href={ctaHref} className={`${styles.desktopCta} ${projectEdge.edge}`}><ProjectEdge />{ctaLabel}<ArrowUpRight aria-hidden="true" size={17} /></Link>
        </div>
      </nav>

      <dialog ref={dialogRef} id="more-navigation" className={styles.panel}
        aria-labelledby="more-navigation-title"
        onCancel={event => { event.preventDefault(); closeMenu(); }}
        onClose={() => { if (!dialogRef.current?.open) closeMenu(); }}
        onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
        <div className={styles.panelInner}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>{brandName}</p><h2 id="more-navigation-title">Explore more</h2></div>
            <button type="button" className={styles.close} onClick={closeMenu} aria-label="Close navigation menu" autoFocus>
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <label className={styles.searchField}>
            <Search aria-hidden="true" size={20} />
            <input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                // Native search fields consume the first Escape to clear text.
                // Keep the dialog's advertised Escape-to-close behavior instead.
                if (event.key === "Escape" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  closeMenu();
                }
              }}
              placeholder="Find a page…" aria-label="Search pages" autoComplete="off" />
            <kbd>ESC</kbd>
          </label>
          <nav aria-label="More" className={styles.moreLinks}>
            {menuLinks.map(link => {
              const Icon = icons[link.href] ?? ArrowUpRight;
              return (
                <Link key={link.href} href={link.href} className={styles.menuLink} onClick={closeMenu}
                  aria-current={isNavigationActive(pathname, link.href) ? "page" : undefined}>
                  <Icon aria-hidden="true" size={20} strokeWidth={1.6} />
                  <span>{link.label}</span><ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              );
            })}
          </nav>
          {query.trim() && <p className={styles.searchStatus} role="status">{menuLinks.length ? `${menuLinks.length} page${menuLinks.length === 1 ? "" : "s"} found` : "No pages found. Try a different name."}</p>}
          <div className={styles.utilities}>
            <button type="button" className={styles.portal} onClick={() => { setQuery(""); onPortal(); }} {...portalDisclosure}>
              <User aria-hidden="true" size={20} strokeWidth={1.6} />
              <span>{authenticated ? "Open Account" : "Client Login"}</span>
              <ArrowUpRight aria-hidden="true" size={16} />
            </button>
            <div className={styles.theme}><span>Appearance</span><ThemeToggle /></div>
          </div>
          <Button href={ctaHref} className={`${styles.cta} ${projectEdge.edge}`} onClick={closeMenu}>
            <ProjectEdge /><Sparkles aria-hidden="true" size={16} />{ctaLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
