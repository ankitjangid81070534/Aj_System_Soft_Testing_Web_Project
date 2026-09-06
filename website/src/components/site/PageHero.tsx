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
  className,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional content rendered to the right on large screens. */
  aside?: ReactNode;
  className?: string;
  /** Optional content rendered under the heading (e.g. filter chips). */
  children?: ReactNode;
}) {
  return (
    <header className={cn(styles.hero, className)} data-scroll-scene>
      <div className={styles.art} aria-hidden="true"><span /><span /><span /></div>
      <div className={styles.inner}>
        <Breadcrumbs items={crumbs} />
        <div
          className={cn(
            styles.heading,
            Boolean(aside) && styles.withAside,
          )}
        >
          <SectionHeader as="h1" eyebrow={eyebrow} title={title} description={description}>
            {children}
          </SectionHeader>
          {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
        </div>
      </div>
    </header>
  );
}
