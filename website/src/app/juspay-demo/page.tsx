import type { Metadata } from "next";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { getServicesIndex } from "@/lib/data/services";
import { getLaunchBenefits } from "@/lib/data/growth";
import { getPublicNavigation } from "@/lib/data/navigation";
import { JuspayDemo } from "@/components/juspay-demo/JuspayDemo";
import { juspayFontClassName } from "@/components/juspay-demo/fonts";

export const metadata: Metadata = {
  title: "Design demo (Juspay-style) | AJS Technology",
  robots: { index: false, follow: false },
};

/**
 * The demo is fed by the same readers as the live site: home content, the full
 * services index (for the mega menu), launch benefits, CMS navigation and
 * settings — so the owner can verify real data, not invented copy.
 */
export default async function JuspayDemoPage() {
  const [content, settings, services, benefits, navigation] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getServicesIndex(),
    getLaunchBenefits(),
    getPublicNavigation(),
  ]);
  return (
    <JuspayDemo
      content={content}
      settings={settings}
      services={services}
      benefits={benefits}
      navLinks={navigation.header}
      fontClassName={juspayFontClassName}
    />
  );
}
