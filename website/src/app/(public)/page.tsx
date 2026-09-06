import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { CTA } from "@/components/ui/CTA";
import { buildRouteMetadata, HOMEPAGE_TITLE } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/seo/site";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { Hero } from "@/components/site/Hero";
import { TrustStrip } from "@/components/site/TrustStrip";
import { ServicesOverview } from "@/components/site/ServicesOverview";
import { PlatformsShowcase } from "@/components/site/PlatformsShowcase";
import { FeaturedProjects } from "@/components/site/FeaturedProjects";
import { Process } from "@/components/site/Process";
import { Industries } from "@/components/site/Industries";
import { TechCapabilities } from "@/components/site/TechCapabilities";
import { WhyUs } from "@/components/site/WhyUs";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { TeamSection } from "@/components/site/TeamSection";
import { BlogPreviewSection } from "@/components/site/BlogPreviewSection";
import { LaunchBenefits } from "@/components/site/LaunchBenefits";
import { getLaunchBenefits } from "@/lib/data/growth";

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
  const [{ services, projects, team, testimonials, posts }, settings, benefits] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getLaunchBenefits(),
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
      <Hero />
      <TrustStrip />
      <LaunchBenefits benefits={benefits} />
      <ServicesOverview services={services} />
      <PlatformsShowcase />
      <FeaturedProjects projects={projects} />
      <Process />
      <Industries />
      <TechCapabilities />
      <WhyUs />
      <TestimonialsSection testimonials={testimonials} />
      <TeamSection members={team} />
      <BlogPreviewSection posts={posts} />
      <div className="mx-auto w-full max-w-content px-4 pb-20 sm:px-6 sm:pb-24">
        <CTA
          eyebrow="Start a project"
          title="Ready to build software around your requirements?"
          description="Tell us what you need — we will propose the right platform, a clear plan and a transparent estimate."
          secondary={{ label: "Request a Consultation", href: "/contact" }}
        />
      </div>
    </>
  );
}
