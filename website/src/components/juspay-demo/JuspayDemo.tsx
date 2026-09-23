import Link from "next/link";
import type { HomeContent } from "@/lib/data/home";
import type { SiteSettings } from "@/lib/data/settings";
import type { ServiceCardModel } from "@/lib/data/services";
import type { LaunchBenefit } from "@/lib/data/growth";
import type { PublicNavLink } from "@/lib/data/navigation";
import { DemoNav } from "./DemoNav";
import { DemoHero } from "./DemoHero";
import { DemoMarquee } from "./DemoMarquee";
import { DemoPlanet } from "./DemoPlanet";
import { DemoResults } from "./DemoResults";
import { DemoWorld } from "./DemoWorld";
import { DemoBuilder } from "./DemoBuilder";
import { DemoRouting } from "./DemoRouting";
import { DemoTriad } from "./DemoTriad";
import { DemoProcess } from "./DemoProcess";
import { DemoIndustries } from "./DemoIndustries";
import { DemoProof } from "./DemoProof";
import { DemoFooter } from "./DemoFooter";
import { createSiteCopy } from "@/lib/data/site-copy";
import styles from "./juspay-demo.module.css";

/**
 * Juspay-style landing demo for design approval. Section rhythm mirrors
 * juspay.io/in top to bottom:
 *
 *  dark  → pill nav with hover mega menus → grid hero with 3D core → logo strip
 *        → numbers band + planet arc that rises on scroll
 *  light → "Results that define" 2×2 illustrated cards → dotted world map
 *        → browser-frame builder mockup → routing dial with satellite nodes
 *        → three framed feature cards
 *  dark  → delivery process stack → industries → real proof (projects / team /
 *          reviews / articles when published) → CTA + footer
 *
 * Every word of copy comes from the live site's own data and section content.
 */
export function JuspayDemo({
  content,
  settings,
  services,
  benefits,
  navLinks,
  fontClassName,
}: {
  content: HomeContent;
  settings: SiteSettings | null;
  services: ServiceCardModel[];
  benefits: LaunchBenefit[];
  navLinks: PublicNavLink[];
  fontClassName: string;
}) {
  const brandName = settings?.brandName ?? "AJ System Soft Technology";
  const shortName = settings?.brandShortName ?? "AJS Technology";
  const ctaHref = settings?.globalCtaHref ?? "/request-quote";
  const ctaLabel = settings?.globalCtaLabel ?? "Start Your Project";

  const copy = createSiteCopy({}, { brand: brandName, shortBrand: shortName });

  return (
    <div className={`${styles.page} ${fontClassName}`} data-juspay-demo>
      <DemoNav brandName={brandName} navLinks={navLinks} services={services} posts={content.posts} ctaHref={ctaHref} />
      <main>
        <DemoHero
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          text={{
            eyebrow: copy.t("home.hero.eyebrow"),
            titleAccent: copy.t("home.hero.titleAccent"),
            titleRest: copy.t("home.hero.titleRest"),
            lead: copy.t("home.hero.lead"),
            secondaryCta: copy.t("home.hero.secondaryCta"),
            points: copy.list("home.hero.points"),
            tags: copy.list("home.hero.tags"),
          }}
        />
        <DemoMarquee />
        <DemoPlanet serviceCount={services.length} benefitCount={benefits.length} />
        <div className={styles.light}>
          <DemoResults shortName={shortName} />
          <DemoWorld serviceCount={services.length} ctaHref={ctaHref} ctaLabel={ctaLabel} copy={copy} />
          <DemoBuilder />
          <DemoRouting copy={copy} />
          <DemoTriad benefits={benefits} copy={copy} />
        </div>
        <DemoProcess />
        <DemoIndustries copy={copy} />
        <DemoProof content={content} copy={copy} />
      </main>
      <DemoFooter brandName={brandName} shortName={shortName} settings={settings} ctaHref={ctaHref} ctaLabel={ctaLabel} copy={copy} />
      <div className={styles.demoBanner}>
        Design demo · <Link href="/">Back to live site</Link>
      </div>
    </div>
  );
}
