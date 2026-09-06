import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import type { ProjectTeaser } from "@/lib/data/mappers";

/**
 * Featured client projects. Rendered only when real, public, published
 * projects exist in the CMS — confidential work never appears here.
 */
export function FeaturedProjects({ projects }: { projects: ProjectTeaser[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeader
          eyebrow="Client work"
          title="Featured projects"
          description="A look at the kind of software we deliver. Confidential engagements stay private by design."
        />
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 6).map((project, index) => (
          <Reveal key={project.id} delay={index * 60} className="h-full">
            <ProjectCard
              name={project.name}
              href={`/projects/${project.slug}`}
              coverUrl={project.coverUrl}
              clientName={project.clientName}
              industry={project.industry}
              platformType={project.platformType}
              summary={project.summary}
              status={project.status}
              isFeatured={project.isFeatured}
              className="h-full"
            />
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-8 flex justify-center">
          <Button href="/projects" variant="outline">
            View all projects
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
