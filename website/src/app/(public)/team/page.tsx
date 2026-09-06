import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/ui/CTA";
import { EmptyState } from "@/components/ui/States";
import { TeamCard } from "@/components/ui/TeamCard";
import { Reveal } from "@/components/site/Reveal";
import { GallerySection } from "@/components/site/GallerySection";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { getPublishedTeam } from "@/lib/data/team";
import { getGalleryForPage } from "@/lib/data/sections";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Our Team",
    description:
      "Meet the people of AJ System Soft Technology (AJS Technology) — the team that understands your requirements and builds, ships and supports your software.",
    path: "/team",
  });
}

export default async function TeamPage() {
  const [team, gallery] = await Promise.all([getPublishedTeam(12), getGalleryForPage("team")]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ])}
      />

      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Team", href: "/team" },
        ]}
        eyebrow="Our team"
        title="The people behind AJS Technology"
        description="The team that will understand your requirements, build your software and stay around to support it."
      />
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        {team.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <Reveal key={member.id} delay={Math.min(index, 7) * 50} className="h-full">
                <TeamCard
                  name={member.name}
                  roleTitle={member.roleTitle}
                  photoUrl={member.photoUrl}
                  shortBio={member.shortBio}
                  skills={member.skills}
                  linkedinUrl={member.linkedinUrl}
                  githubUrl={member.githubUrl}
                  portfolioUrl={member.portfolioUrl}
                  email={member.email}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div>
            <EmptyState
              icon={<Users aria-hidden="true" className="h-6 w-6" />}
              title="Team profiles are being prepared"
              description="We only publish real profiles with real people — no stock photos, no invented titles. Check back soon, or reach out directly."
              action={
                <Button href="/contact" className="mt-2">
                  Contact us
                </Button>
              }
            />
          </div>
        )}
      </div>

      {gallery ? <GallerySection content={gallery} /> : null}

      <div className="mx-auto w-full max-w-content px-4 pb-20 sm:px-6 sm:pb-24">
        <CTA
          eyebrow="Work with this team"
          title="Put these people on your project."
          description="Tell us your requirements — the same team that builds your software stays with it for support."
        />
      </div>
    </>
  );
}
