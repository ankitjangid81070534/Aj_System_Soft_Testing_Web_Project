import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getServicesIndex } from "@/lib/data/services";
import { Footer } from "@/components/ui/Footer";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublicNavigation } from "@/lib/data/navigation";
import { getTopBarAnnouncement, getPopupOffer } from "@/lib/data/growth";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { OfferPopup } from "@/components/site/OfferPopup";
import { PublicSiteFrame } from "@/components/site/PublicSiteFrame";
import { ContactHub } from "@/components/site/ContactHub";
import { getContactHubActions } from "@/lib/contact-hub";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, navigation, topBarAnnouncement, popupOffer, services] = await Promise.all([
    getSiteSettings(),
    getPublicNavigation(),
    getTopBarAnnouncement(),
    getPopupOffer(),
    getServicesIndex(),
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
      header={<SiteHeader
        navLinks={navigation.header}
        services={services}
        brandName={settings?.brandName}
        brandShortName={settings?.brandShortName}
        ctaLabel={settings?.globalCtaLabel}
        ctaHref={settings?.globalCtaHref}
      />}
      footer={<Footer settings={settings} managedLinks={navigation.footer} />}
      afterFooter={<>
        <ContactHub actions={getContactHubActions(settings)} />
        {popupOffer && <OfferPopup offer={popupOffer} />}
      </>}
    >
      {children}
    </PublicSiteFrame>
  );
}
