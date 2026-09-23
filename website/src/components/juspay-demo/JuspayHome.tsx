import type { HomeContent } from "@/lib/data/home";
import type { SiteSettings } from "@/lib/data/settings";
import type { LaunchBenefit } from "@/lib/data/growth";
import type { CaseStudy, Package, TrustedClient } from "@/lib/data/sales";
import { whatsappLink } from "@/lib/data/settings";
import { DemoHero } from "./DemoHero";
import { DemoHeroProof } from "./DemoHeroProof";
import { DemoMarquee } from "./DemoMarquee";
import { DemoPlanet } from "./DemoPlanet";
import { DemoResults } from "./DemoResults";
import { DemoWorld } from "./DemoWorld";
import { DemoBuilder } from "./DemoBuilder";
import { DemoRouting } from "./DemoRouting";
import { DemoTriad } from "./DemoTriad";
import { DemoServices } from "./DemoServices";
import { DemoLiveDashboard } from "./DemoLiveDashboard";
import { DemoStack } from "./DemoStack";
import { DemoJourney } from "./DemoJourney";
import { DemoWhyUs } from "./DemoWhyUs";
import { DemoProcess } from "./DemoProcess";
import { DemoIndustries } from "./DemoIndustries";
import { DemoGallery } from "./DemoGallery";
import { DemoProof } from "./DemoProof";
import { DemoTrust } from "./DemoTrust";
import { DemoCaseStudies } from "./DemoCaseStudies";
import { DemoPackages } from "./DemoPackages";
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
 * technology / why-us sections (dark Juspay-style grids), delivery process, industries, and
 * the real proof blocks (projects, reviews, team, articles) that hide when
 * the CMS has no records. Nothing is invented and nothing is dropped.
 *
 * Conversion order (2026-09-23): the interactive `DemoLiveDashboard` (clearly
 * labelled sample data) and the admin-managed case studies sit directly under
 * the hero so proof appears in the first two screens. `DemoPlatforms` is no
 * longer mounted — it repeated DemoRouting's "One team, every platform" heading
 * and the hero chips / DemoServices already list the same platforms.
 */
export function JuspayHome({
  content,
  settings,
  benefits,
  sales,
}: {
  content: HomeContent;
  settings: SiteSettings | null;
  benefits: LaunchBenefit[];
  sales: { clients: TrustedClient[]; caseStudies: CaseStudy[]; packages: Package[] };
}) {
  const brandName = settings?.brandName ?? "AJ System Soft Technology";
  const shortName = settings?.brandShortName ?? "AJS Technology";
  const ctaHref = settings?.globalCtaHref ?? "/request-quote";
  const ctaLabel = settings?.globalCtaLabel ?? "Start Your Project";
  const serviceCount = content.services.length;

  return (
    <div data-home-experience className={`${styles.page} ${juspayFontClassName}`} data-juspay-home>
      <DemoHero ctaHref={ctaHref} ctaLabel={ctaLabel} brandName={brandName} />
      <DemoHeroProof
        projectCount={content.projects.length}
        serviceCount={serviceCount}
        clients={sales.clients}
      />
      <DemoMarquee />
      <DemoLiveDashboard ctaHref={ctaHref} />
      <DemoCaseStudies studies={sales.caseStudies} />
      <DemoPlanet serviceCount={serviceCount} benefitCount={benefits.length} />
      <div className={styles.light} data-light-band>
        <DemoResults shortName={shortName} />
        <DemoWorld serviceCount={serviceCount} ctaHref={ctaHref} ctaLabel={ctaLabel} />
        <DemoBuilder />
        <DemoRouting />
        <DemoTriad benefits={benefits} />
        <DemoTrust clients={sales.clients} />
      </div>
      <DemoStack />
      <DemoJourney brandName={shortName} />
      <DemoWhyUs brandName={brandName} />
      <DemoServices services={content.services} />
      <DemoProcess />
      <DemoIndustries />
      <div className={styles.light} data-light-band>
        <DemoPackages packages={sales.packages} whatsappHref={whatsappLink(settings)} />
      </div>
      <DemoGallery projects={content.projects} />
      <DemoProof content={content} />
      <DemoCta ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </div>
  );
}
