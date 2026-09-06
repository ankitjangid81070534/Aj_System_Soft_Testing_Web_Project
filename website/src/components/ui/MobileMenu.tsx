"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, User } from "lucide-react";
import { NAV_LINKS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { PublicNavLink } from "@/lib/data/navigation";

/**
 * Mobile-specific navigation panel (below the lg breakpoint) built on the
 * native dialog element for focus trapping and ESC handling.
 */
export function MobileMenu({
  open,
  onClose,
  onPortal,
  portalAuthenticated,
  navLinks = NAV_LINKS,
  brandName = BRAND.primaryName,
  ctaLabel = "Start Your Project",
  ctaHref = "/request-quote",
}: {
  open: boolean;
  onClose: () => void;
  onPortal: () => void;
  portalAuthenticated: boolean;
  navLinks?: readonly PublicNavLink[];
  brandName?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="mobile-menu"
      onClose={onClose}
      onClick={(event) => {
        if (event.target instanceof HTMLDialogElement) onClose();
      }}
      aria-label="Site navigation"
      className="fixed inset-0 m-0 ml-auto h-dvh max-h-dvh w-[min(21rem,calc(100vw-2.5rem))] rounded-l-3xl border border-line bg-surface p-0 shadow-e4 open:animate-drawer-in"
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
        <div
          aria-hidden="true"
          className="aurora aurora-a pointer-events-none -right-20 -top-24 h-64 w-64"
        />
        <div className="relative flex items-center justify-between border-b border-line px-5 py-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
            <span aria-hidden="true" className="icon-bead h-7 w-7 !rounded-[9px] text-[10px] font-bold">
              AJ
            </span>
            {brandName}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThemeToggle />
            <IconButton aria-label="Close navigation menu" onClick={onClose} size="sm">
              <X aria-hidden="true" className="h-5 w-5" />
            </IconButton>
          </span>
        </div>
        <nav aria-label="Mobile" className="relative flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className="animate-panel-in"
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms`, animationFillMode: "both" }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-[15px] font-medium text-ink transition-[background-color,border-color,transform] duration-200 ease-soft hover:translate-x-0.5 hover:border-line hover:bg-canvas-raised focus-ring"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-brand-gradient opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative flex flex-col gap-2.5 border-t border-line p-4">
          <button
            type="button"
            onClick={onPortal}
            className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface py-2.5 text-sm font-medium text-ink shadow-e1 transition-[background-color,border-color] duration-200 hover:border-brand-200 hover:bg-canvas-raised focus-ring"
          >
            <User aria-hidden="true" className="h-4 w-4 text-brand-600" />
            <span>{portalAuthenticated ? "Open Account" : "Client Login"}</span>
          </button>
          <Button href={ctaHref} className="w-full" onClick={onClose}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
