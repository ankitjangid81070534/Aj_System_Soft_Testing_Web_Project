import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { getServicesIndex } from "@/lib/data/services";
import { getLaunchBenefits } from "@/lib/data/growth";
import { getPublicNavigation } from "@/lib/data/navigation";
import { JuspayDemo } from "@/components/juspay-demo/JuspayDemo";

/**
 * Typefaces matching the reference site's voice: a geometric grotesque for
 * headings (Juspay uses General Sans / Plus Jakarta Sans) and Manrope for body.
 * Scoped to this route only via CSS variables on the demo root.
 */
const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-jd-heading",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jd-body",
});

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
      fontClassName={`${heading.variable} ${body.variable}`}
    />
  );
}
