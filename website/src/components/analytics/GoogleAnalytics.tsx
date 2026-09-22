import Script from "next/script";
import { SectionEngagement } from "./SectionEngagement";

/**
 * Google Analytics 4. Renders nothing until the owner stores a measurement ID
 * (`NEXT_PUBLIC_GA_MEASUREMENT_ID`), so the site keeps working unconfigured.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!measurementId) return null;

  return (
    <>
      <Script id="ga-loader" async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <Script id="ga-init">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${measurementId}', { send_page_view: true });
      `}</Script>
      <SectionEngagement />
    </>
  );
}
