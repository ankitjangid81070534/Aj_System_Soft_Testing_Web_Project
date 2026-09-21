import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { HERO_TONES, HeroScene, type HeroSceneVariant, type HeroTone } from "@/components/site/HeroScene";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";
import styles from "./page-hero.module.css";

/**
 * Shared reference-inspired inner-page header: sculptural glass backdrop,
 * breadcrumbs, eyebrow pill, display heading and optional right-side slot.
 * Pure CSS visuals — no JS, no layout shift, works without images.
 *
 * `scene` + `tone` give each page its own Juspay-style 3D artwork and accent
 * colour (see HeroScene). `accent` highlights the given phrase inside the
 * title in that colour while the heading stays one normal-flow text node.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  accent,
  description,
  aside,
  beforeTitle,
  scene,
  tone = "blue",
  className,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  /** Phrase inside a string `title` to paint in the tone colour. */
  accent?: string;
  description?: ReactNode;
  /** Optional content rendered to the right on large screens. */
  aside?: ReactNode;
  /** Existing category, icon or publication badges above the title. */
  beforeTitle?: ReactNode;
  /** Per-page 3D artwork; rendered to the right when no `aside` is given. */
  scene?: HeroSceneVariant;
  tone?: HeroTone;
  className?: string;
  /** Optional content rendered under the heading (e.g. filter chips). */
  children?: ReactNode;
}) {
  const showScene = Boolean(scene) && !aside;
  const styleVars = { "--tone": HERO_TONES[tone] } as CSSProperties;

  let heading: ReactNode = title;
  if (typeof title === "string" && accent) {
    const at = title.indexOf(accent);
    if (at >= 0) {
      heading = (
        <>
          {title.slice(0, at)}
          <span className={styles.accent}>{accent}</span>
          {title.slice(at + accent.length)}
        </>
      );
    }
  }

  return (
    <header className={cn(styles.hero, className)} style={styleVars} data-scroll-scene>
      {showScene ? null : (
        <div className={styles.art} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      <div className={styles.inner}>
        <Breadcrumbs items={crumbs} />
        <div className={cn(styles.heading, (Boolean(aside) || showScene) && styles.withAside)}>
          <div className={styles.copy}>
            {beforeTitle ? <div className={styles.beforeTitle}>{beforeTitle}</div> : null}
            {/* Keep page titles in normal text flow, including long CMS titles.
                Per-word inline blocks can split under balanced wrapping. */}
            <SectionHeader as="h1" eyebrow={eyebrow} title={<span>{heading}</span>} description={description}>
              {children}
            </SectionHeader>
          </div>
          {aside ? <div className={styles.aside}>{aside}</div> : null}
          {showScene && scene ? <HeroScene variant={scene} className={styles.scene} /> : null}
        </div>
      </div>
    </header>
  );
}
