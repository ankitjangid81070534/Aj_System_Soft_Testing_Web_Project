"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./bottom-navigation.module.css";
import { NAV_LINKS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import { Button } from "@/components/ui/Button";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { PortalLoginModal } from "@/components/portal/PortalLoginModal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PublicNavLink } from "@/lib/data/navigation";

/**
 * Brand masthead and shared bottom navigation. Existing portal/session behavior
 * stays here so changing navigation never changes authentication.
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
    <header>
      <ScrollProgress />
      <div className={styles.brandBar}>
        <Link href="/" className={`${styles.brand} focus-ring`} aria-label={`${safeBrandName} — home`}>
          <span aria-hidden="true" className={styles.brandMark}>AJ</span>
          <span className={styles.fullName}>{safeBrandName}</span>
          <span className={styles.shortName}>{safeBrandShortName}</span>
        </Link>
        <Button href={safeCtaHref} size="sm">{safeCtaLabel}</Button>
      </div>
      <BottomNavigation
        navLinks={navLinks}
        open={menuOpen}
        onOpen={() => setMenuOpen(true)}
        onClose={() => setMenuOpen(false)}
        onPortal={() => void openPortal()}
        authenticated={authenticated}
        portalOpen={portalOpen}
        brandName={safeBrandName}
        ctaLabel={safeCtaLabel}
        ctaHref={safeCtaHref}
      />
      {portalOpen ? <PortalLoginModal onClose={() => setPortalOpen(false)} /> : null}
    </header>
  );
}
