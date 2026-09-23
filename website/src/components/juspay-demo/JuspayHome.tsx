import type { HomeContent } from "@/lib/data/home";
import type { SiteSettings } from "@/lib/data/settings";
import type { LaunchBenefit } from "@/lib/data/growth";
import type { CaseStudy, Package, TrustedClient } from "@/lib/data/sales";
import { whatsappLink } from "@/lib/data/settings";
import { createSiteCopy, type SiteCopyOverrides } from "@/lib/data/site-copy";
import { DemoHero } from "./DemoHero";
import { DemoHeroProof } from "./DemoHeroProof";
import { DemoMarquee } from "./DemoMarquee";
import { DemoWorld } from "./DemoWorld";
import { DemoRouting } from "./DemoRouting";
import { DemoTriad } from "./DemoTriad";
import { DemoServices } from "./DemoServices";
import { DemoLiveDashboard } from "./DemoLiveDashboard";
import { DemoStack } from "./DemoStack";
import { DemoJourney } from "./DemoJourney";
import { DemoWhyUs } from "./DemoWhyUs";
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
 * Conversion order (2026-09-23): hero → proof (live sample dashboard + case
 * studies) → trust/offer → services & technology → why us / journey →
 * industries → packages → gallery → reviews → CTA. Duplicate sections are no
 * longer mounted (files kept for reference): `DemoPlatforms` and `DemoRouting`
 * repeated each other, `DemoBuilder` duplicated `DemoLiveDashboard`,
 * `DemoResults` duplicated `DemoWhyUs`, `DemoProcess` duplicated `DemoJourney`
 * and `DemoPlanet` repeated the routing band.
 */
export function JuspayHome({
  content,
  settings,
  benefits,
  sales,
  copyOverrides = {},
}: {
  content: HomeContent;
  settings: SiteSettings | null;
  benefits: LaunchBenefit[];
  sales: { clients: TrustedClient[]; caseStudies: CaseStudy[]; packages: Package[] };
  /** Admin-edited website text (table `site_copy`); empty = built-in defaults. */
  copyOverrides?: SiteCopyOverrides;
}) {
  const brandName = settings?.brandName ?? "AJ System Soft Technology";
  const shortName = settings?.brandShortName ?? "AJS Technology";
  const ctaHref = settings?.globalCtaHref ?? "/request-quote";
  const ctaLabel = settings?.globalCtaLabel ?? "Start Your Project";
  const serviceCount = content.services.length;
  const copy = createSiteCopy(copyOverrides, { brand: brandName, shortBrand: shortName });

  return (
    <div data-home-experience className={`${styles.page} ${juspayFontClassName}`} data-juspay-home>
      {/* Client components receive plain resolved strings (functions are not
          serializable across the server/client boundary). */}
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
      <DemoHeroProof
        projectCount={content.projects.length}
        serviceCount={serviceCount}
        clients={sales.clients}
        copy={copy}
      />
      <DemoMarquee />
      <DemoLiveDashboard
        ctaHref={ctaHref}
        text={{
          eyebrow: copy.t("home.dashboard.eyebrow"),
          title: copy.t("home.dashboard.title"),
          titleAccent: copy.t("home.dashboard.titleAccent"),
          lead: copy.t("home.dashboard.lead"),
        }}
      />
      <DemoCaseStudies studies={sales.caseStudies} copy={copy} />
      <div className={styles.light} data-light-band>
        <DemoTrust clients={sales.clients} copy={copy} />
        <DemoRouting copy={copy} />
        <DemoTriad benefits={benefits} copy={copy} />
        <DemoWorld serviceCount={serviceCount} ctaHref={ctaHref} ctaLabel={ctaLabel} copy={copy} />
      </div>
      <DemoServices services={content.services} copy={copy} />
      <DemoStack copy={copy} />
      <DemoWhyUs brandName={brandName} copy={copy} />
      <DemoJourney copy={copy} />
      <DemoIndustries copy={copy} />
      <div className={styles.light} data-light-band>
        <DemoPackages packages={sales.packages} whatsappHref={whatsappLink(settings)} copy={copy} />
      </div>
      <DemoGallery projects={content.projects} copy={copy} />
      <DemoProof content={content} copy={copy} />
      <DemoCta ctaHref={ctaHref} ctaLabel={ctaLabel} copy={copy} />
    </div>
  );
}
