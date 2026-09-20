import Link from "next/link";
import type { HomeContent } from "@/lib/data/home";
import type { SiteSettings } from "@/lib/data/settings";
import { DemoNav } from "./DemoNav";
import { DemoHero } from "./DemoHero";
import { DemoMarquee } from "./DemoMarquee";
import { DemoNumbers } from "./DemoNumbers";
import { DemoOutcomes } from "./DemoOutcomes";
import { DemoProductDemo } from "./DemoProductDemo";
import { DemoCoverage } from "./DemoCoverage";
import { DemoFooter } from "./DemoFooter";
import styles from "./juspay-demo.module.css";

/**
 * Juspay-style landing demo for design approval. Composes the same section
 * rhythm as juspay.io/in (pill nav → grid hero with 3D core → logo strip →
 * numbers → stacked outcomes → floating device demo → coverage → CTA → footer)
 * using the site's real services and settings.
 */
export function JuspayDemo({
  content,
  settings,
  serviceCount,
  fontClassName,
}: {
  content: HomeContent;
  settings: SiteSettings | null;
  serviceCount: number;
  fontClassName: string;
}) {
  const brandName = settings?.brandName ?? "AJ System Soft Technology";
  const shortName = settings?.brandShortName ?? "AJS Technology";
  const ctaHref = settings?.globalCtaHref ?? "/contact";

  return (
    <div className={`${styles.page} ${fontClassName}`} data-juspay-demo>
      <DemoNav brandName={shortName} />
      <main>
        <DemoHero ctaHref={ctaHref} />
        <DemoMarquee />
        <DemoNumbers serviceCount={serviceCount} />
        <DemoOutcomes services={content.services} />
        <DemoProductDemo />
        <DemoCoverage serviceCount={serviceCount} />
      </main>
      <DemoFooter brandName={brandName} shortName={shortName} ctaHref={ctaHref} />
      <div className={styles.demoBanner}>
        Design demo · <Link href="/">Back to live site</Link>
      </div>
    </div>
  );
}
