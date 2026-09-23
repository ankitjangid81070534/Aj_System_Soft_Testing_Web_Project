"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/design-preview/reference.module.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TiltEngine } from "@/components/motion/TiltEngine";

/** Keeps existing server-rendered navigation, offers, footer and auth controls.
 * Shared navigation/footer presentation covers every public and account route.
 */
export function PublicSiteFrame({ children, header, footer, beforeHeader, afterFooter }: {
  children: ReactNode; header: ReactNode; footer: ReactNode;
  beforeHeader: ReactNode; afterFooter: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <div
      className={`site-shell dark juspay-site flex min-h-svh flex-col ${isHome ? styles.page : ""}`}
      data-home-page={isHome || undefined}
    >
      <SmoothScroll />
      <TiltEngine />
      {beforeHeader}
      <div className={styles.headerFrame} data-site-header>{header}</div>
      <main id="main-content" className="flex-1">
        {/* Keyed by path: every route change replays the soft page entrance
            (page-transitions.css) while header, footer and ContactHub persist. */}
        <div key={pathname} className="page-enter">{children}</div>
      </main>
      <div className={styles.footerFrame}>{footer}</div>
      {afterFooter}
    </div>
  );
}
