"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/design-preview/reference.module.css";

/** Keeps existing server-rendered navigation, offers, footer and auth controls.
 * Shared navigation/footer presentation covers every public and account route.
 */
export function PublicSiteFrame({ children, header, footer, beforeHeader, afterFooter }: {
  children: ReactNode; header: ReactNode; footer: ReactNode;
  beforeHeader: ReactNode; afterFooter: ReactNode;
}) {
  const isHome = usePathname() === "/";
  return (
    <div className={`site-shell flex min-h-svh flex-col ${isHome ? styles.page : ""}`} data-home-page={isHome || undefined}>
      {beforeHeader}
      <div className={styles.headerFrame} data-site-header>{header}</div>
      <main id="main-content" className="flex-1">{children}</main>
      <div className={styles.footerFrame}>{footer}</div>
      {afterFooter}
    </div>
  );
}
