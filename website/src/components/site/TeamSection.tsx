import { TeamCard } from "@/components/ui/TeamCard";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";
import type { TeamTeaser } from "@/lib/data/mappers";

/**
 * The team section sits near the lower part of the landing page and renders
 * only when real, public team members exist in the CMS.
 */
export function TeamSection({ members }: { members: TeamTeaser[] }) {
  if (members.length === 0) return null;

  return (
    <section data-home-section="team" className="relative mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden="true"
        className="aurora aurora-c -right-40 bottom-0 -z-10 hidden h-96 w-96 lg:block"
      />
      <Reveal>
        <SectionHeader
          eyebrow="Our team"
          title="The people behind AJS Technology"
          description="The team that will understand your requirements and build your software."
          align="center"
        />
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {members.slice(0, 4).map((member, index) => (
          <Reveal key={member.id} delay={index * 50} className="h-full">
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
      {members.length > 4 ? (
        <Reveal>
          <div className="mt-8 flex justify-center">
            <Button href="/team" variant="outline">
              Meet the full team
            </Button>
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}
