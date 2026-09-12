"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  ArrowUpRight, BriefcaseBusiness, CircleHelp, Cpu, House, Info,
  LayoutGrid, MessageCircle, Plus, Sparkles, Star, User, Users, X,
} from "lucide-react";
import type { PublicNavLink } from "@/lib/data/navigation";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";
import { isNavigationActive, splitNavigation } from "@/lib/bottom-navigation";
import styles from "./bottom-navigation.module.css";

const icons: Record<string, typeof House> = {
  "/": House, "/services": LayoutGrid, "/projects": BriefcaseBusiness,
  "/contact": MessageCircle, "/ai-methods": Cpu, "/reviews": Star,
  "/about": Info, "/team": Users,
};

export function BottomNavigation({
  navLinks, open, onOpen, onClose, onPortal, authenticated, brandName, ctaLabel, ctaHref,
}: {
  navLinks: readonly PublicNavLink[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPortal: () => void;
  authenticated: boolean;
  brandName: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const pathname = usePathname();
  const { primary, overflow } = splitNavigation(navLinks);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const moreActive = overflow.some(link => isNavigationActive(pathname, link.href)) || pathname.startsWith("/account");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = moreRef.current;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  function renderLink(link: PublicNavLink) {
    const Icon = icons[link.href] ?? CircleHelp;
    return (
      <Link key={link.href} href={link.href} className={styles.item}
        aria-current={isNavigationActive(pathname, link.href) ? "page" : undefined}>
        <Icon aria-hidden="true" strokeWidth={1.65} />
        <span>{link.label}</span>
      </Link>
    );
  }

  return (
    <>
      <nav aria-label="Main" className={styles.dock} data-bottom-navigation>
        {primary.slice(0, 2).map(renderLink)}
        <button ref={moreRef} type="button" className={styles.more} onClick={onOpen}
          aria-label="More navigation options" aria-haspopup="dialog" aria-expanded={open}
          aria-controls="more-navigation" data-active={moreActive || undefined}>
          <span className={styles.moreOrb}><Plus aria-hidden="true" strokeWidth={1.8} /></span>
          <span>More</span>
        </button>
        {primary.slice(2).map(renderLink)}
      </nav>

      <dialog ref={dialogRef} id="more-navigation" className={styles.panel}
        aria-labelledby="more-navigation-title"
        onCancel={event => { event.preventDefault(); onClose(); }}
        onClose={() => { if (!dialogRef.current?.open) onClose(); }}
        onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <div className={styles.panelInner}>
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>{brandName}</p><h2 id="more-navigation-title">Explore more</h2></div>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close navigation menu" autoFocus>
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <nav aria-label="More" className={styles.moreLinks}>
            {overflow.map(link => {
              const Icon = icons[link.href] ?? ArrowUpRight;
              return (
                <Link key={link.href} href={link.href} className={styles.menuLink} onClick={onClose}
                  aria-current={isNavigationActive(pathname, link.href) ? "page" : undefined}>
                  <Icon aria-hidden="true" size={20} strokeWidth={1.6} />
                  <span>{link.label}</span><ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              );
            })}
          </nav>
          <div className={styles.utilities}>
            <button type="button" className={styles.portal} onClick={onPortal}>
              <User aria-hidden="true" size={20} strokeWidth={1.6} />
              <span>{authenticated ? "Open Account" : "Client Login"}</span>
              <ArrowUpRight aria-hidden="true" size={16} />
            </button>
            <div className={styles.theme}><span>Appearance</span><ThemeToggle /></div>
          </div>
          <Button href={ctaHref} className={styles.cta} onClick={onClose}>
            <Sparkles aria-hidden="true" size={16} />{ctaLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
