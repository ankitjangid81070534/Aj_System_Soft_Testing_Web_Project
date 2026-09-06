"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/design-preview/reference.module.css";

/** Keeps existing server-rendered navigation, offers, footer and auth controls.
 * New presentation is scoped to the homepage, not account/admin/other routes.
 */
export function PublicSiteFrame({ children, header, footer, beforeHeader, afterFooter }: {
  children: ReactNode; header: ReactNode; footer: ReactNode;
  beforeHeader: ReactNode; afterFooter: ReactNode;
}) {
  const isHome = usePathname() === "/";
  return (
    <div className={`flex min-h-svh flex-col ${isHome ? styles.page : ""}`} data-home-page={isHome || undefined}>
      {beforeHeader}
      <div className={isHome ? styles.headerFrame : "contents"}>{header}</div>
      <main id="main-content" className="flex-1">{children}</main>
      <div className={isHome ? styles.footerFrame : "contents"}>{footer}</div>
      {afterFooter}
    </div>
  );
}
