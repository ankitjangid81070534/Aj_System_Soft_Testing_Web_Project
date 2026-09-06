import type { Metadata } from "next";
import { MarketingHeader } from "@/components/ui/MarketingHeader";
import { Footer } from "@/components/ui/Footer";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublicNavigation } from "@/lib/data/navigation";
import { getLaunchBenefits } from "@/lib/data/growth";
import { HomeExperience } from "@/components/design-preview/HomeExperience";
import styles from "@/components/design-preview/reference.module.css";

export const metadata: Metadata = {
  title: "Design preview | AJS Technology",
  robots: { index: false, follow: false },
};

export default async function DesignPreviewPage() {
  const [content, settings, navigation, benefits] = await Promise.all([
    getHomeContent(), getSiteSettings(), getPublicNavigation(), getLaunchBenefits(),
  ]);
  return (
    <div className={styles.page} data-design-preview>
      <a href="#preview-content" className={styles.skipLink}>Skip to content</a>
      <div className={styles.headerFrame}>
        <MarketingHeader navLinks={navigation.header} brandName={settings?.brandName} brandShortName={settings?.brandShortName} ctaLabel={settings?.globalCtaLabel} ctaHref={settings?.globalCtaHref} />
      </div>
      <main id="preview-content"><HomeExperience content={content} benefits={benefits} /></main>
      <div className={styles.footerFrame}><Footer settings={settings} managedLinks={navigation.footer} /></div>
    </div>
  );
}
