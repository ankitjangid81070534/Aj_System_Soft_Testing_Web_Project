import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { FALLBACK_SERVICES } from "@/lib/data/services-fallback";
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

export default async function JuspayDemoPage() {
  const [content, settings] = await Promise.all([getHomeContent(), getSiteSettings()]);
  return (
    <JuspayDemo
      content={content}
      settings={settings}
      serviceCount={FALLBACK_SERVICES.length}
      fontClassName={`${heading.variable} ${body.variable}`}
    />
  );
}
