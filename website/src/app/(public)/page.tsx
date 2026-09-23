import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata, HOMEPAGE_TITLE } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/seo/site";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { JuspayHome } from "@/components/juspay-demo/JuspayHome";
import { getLaunchBenefits } from "@/lib/data/growth";
import { getCaseStudies, getPackages, getTrustedClients } from "@/lib/data/sales";
import { getSiteCopyOverrides } from "@/lib/data/site-copy";

export const revalidate = 300;
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    absoluteTitle: true,
    title: HOMEPAGE_TITLE,
    description: BRAND.description,
    path: "/",
  });
}

export default async function HomePage() {
  const [
    { services, projects, team, testimonials, posts },
    settings,
    benefits,
    clients,
    caseStudies,
    packages,
    copyOverrides,
  ] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getLaunchBenefits(),
    getTrustedClients(),
    getCaseStudies(),
    getPackages(),
    getSiteCopyOverrides(),
  ]);

  return (
    <>
      <JsonLd
        data={localBusinessJsonLd({
          contactEmail: settings?.contactEmail,
          phone: settings?.phone,
          addressLine: settings?.addressLine,
          businessHours: settings?.businessHours,
          mapUrl: settings?.mapUrl,
          sameAs: settings?.socialLinks.map((link) => link.url),
        })}
      />
      <JuspayHome
        content={{ services, projects, team, testimonials, posts }}
        settings={settings}
        benefits={benefits}
        sales={{ clients, caseStudies, packages }}
        copyOverrides={copyOverrides}
      />
    </>
  );
}
