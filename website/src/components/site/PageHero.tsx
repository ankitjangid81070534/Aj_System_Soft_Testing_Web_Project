import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";
import styles from "./page-hero.module.css";

/**
 * Shared reference-inspired inner-page header: sculptural glass backdrop,
 * breadcrumbs, eyebrow pill, display heading and optional right-side slot.
 * Pure CSS visuals — no JS, no layout shift, works without images.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  description,
  aside,
  beforeTitle,
  className,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional content rendered to the right on large screens. */
  aside?: ReactNode;
  /** Existing category, icon or publication badges above the title. */
  beforeTitle?: ReactNode;
  className?: string;
  /** Optional content rendered under the heading (e.g. filter chips). */
  children?: ReactNode;
}) {
  return (
    <header className={cn(styles.hero, className)} data-scroll-scene>
      <div className={styles.art} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.inner}>
        <Breadcrumbs items={crumbs} />
        <div className={cn(styles.heading, Boolean(aside) && styles.withAside)}>
          <div className={styles.copy}>
            {beforeTitle ? <div className={styles.beforeTitle}>{beforeTitle}</div> : null}
            {/* Keep page titles in normal text flow, including long CMS titles.
                Per-word inline blocks can split under balanced wrapping. */}
            <SectionHeader as="h1" eyebrow={eyebrow} title={<span>{title}</span>} description={description}>
              {children}
            </SectionHeader>
          </div>
          {aside ? <div className={styles.aside}>{aside}</div> : null}
        </div>
      </div>
    </header>
  );
}
