import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import { MarketingHeader } from "@/components/ui/MarketingHeader";
import { Footer } from "@/components/ui/Footer";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublicNavigation } from "@/lib/data/navigation";
import { getTopBarAnnouncement, getPopupOffer } from "@/lib/data/growth";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { OfferPopup } from "@/components/site/OfferPopup";
import { PublicSiteFrame } from "@/components/site/PublicSiteFrame";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, navigation, topBarAnnouncement, popupOffer] = await Promise.all([
    getSiteSettings(),
    getPublicNavigation(),
    getTopBarAnnouncement(),
    getPopupOffer(),
  ]);

  return (
    <PublicSiteFrame
      beforeHeader={<>
        {topBarAnnouncement && <AnnouncementBar announcement={topBarAnnouncement} />}
        <JsonLd data={organizationJsonLd({
          contactEmail: settings?.contactEmail,
          phone: settings?.phone,
          sameAs: settings?.socialLinks.map((link) => link.url),
        })} />
        <JsonLd data={webSiteJsonLd()} />
        <a href="#main-content" className="sr-only z-70 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-70 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-e3">Skip to content</a>
      </>}
      header={<MarketingHeader
        navLinks={navigation.header}
        brandName={settings?.brandName}
        brandShortName={settings?.brandShortName}
        ctaLabel={settings?.globalCtaLabel}
        ctaHref={settings?.globalCtaHref}
      />}
      footer={<Footer settings={settings} managedLinks={navigation.footer} />}
      afterFooter={popupOffer && <OfferPopup offer={popupOffer} />}
    >
      {children}
    </PublicSiteFrame>
  );
}
