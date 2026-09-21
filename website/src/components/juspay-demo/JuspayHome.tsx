import type { HomeContent } from "@/lib/data/home";
import type { SiteSettings } from "@/lib/data/settings";
import type { LaunchBenefit } from "@/lib/data/growth";
import { DemoHero } from "./DemoHero";
import { DemoMarquee } from "./DemoMarquee";
import { DemoPlanet } from "./DemoPlanet";
import { DemoResults } from "./DemoResults";
import { DemoWorld } from "./DemoWorld";
import { DemoBuilder } from "./DemoBuilder";
import { DemoRouting } from "./DemoRouting";
import { DemoTriad } from "./DemoTriad";
import { DemoServices } from "./DemoServices";
import { DemoPlatforms } from "./DemoPlatforms";
import { DemoStack } from "./DemoStack";
import { DemoWhyUs } from "./DemoWhyUs";
import { DemoProcess } from "./DemoProcess";
import { DemoIndustries } from "./DemoIndustries";
import { DemoGallery } from "./DemoGallery";
import { DemoProof } from "./DemoProof";
import { DemoCta } from "./DemoCta";
import { juspayFontClassName } from "./fonts";
import styles from "./juspay-demo.module.css";

/**
 * The live homepage in the approved Juspay-style presentation. It renders
 * inside the shared public header/footer (`PublicSiteFrame`), so the demo's own
 * nav, footer and "back to live site" banner are omitted.
 *
 * Every unit of the previous homepage is still here, fed by the same readers:
 * hero + CTA settings, launch benefits (triad), all published services, the
 * platforms / technology / why-us sections (dark Juspay-style grids), delivery process, industries, and
 * the real proof blocks (projects, reviews, team, articles) that hide when
 * the CMS has no records. Nothing is invented and nothing is dropped.
 */
export function JuspayHome({
  content,
  settings,
  benefits,
}: {
  content: HomeContent;
  settings: SiteSettings | null;
  benefits: LaunchBenefit[];
}) {
  const brandName = settings?.brandName ?? "AJ System Soft Technology";
  const shortName = settings?.brandShortName ?? "AJS Technology";
  const ctaHref = settings?.globalCtaHref ?? "/request-quote";
  const ctaLabel = settings?.globalCtaLabel ?? "Start Your Project";
  const serviceCount = content.services.length;

  return (
    <div data-home-experience className={`${styles.page} ${juspayFontClassName}`} data-juspay-home>
      <DemoHero ctaHref={ctaHref} ctaLabel={ctaLabel} brandName={brandName} />
      <DemoMarquee />
      <DemoPlanet serviceCount={serviceCount} benefitCount={benefits.length} />
      <div className={styles.light}>
        <DemoResults shortName={shortName} />
        <DemoWorld serviceCount={serviceCount} ctaHref={ctaHref} ctaLabel={ctaLabel} />
        <DemoBuilder />
        <DemoRouting />
        <DemoTriad benefits={benefits} />
      </div>
      <DemoPlatforms />
      <DemoStack />
      <DemoWhyUs brandName={brandName} />
      <DemoServices services={content.services} />
      <DemoProcess />
      <DemoIndustries />
      <DemoGallery projects={content.projects} />
      <DemoProof content={content} />
      <DemoCta ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </div>
  );
}
