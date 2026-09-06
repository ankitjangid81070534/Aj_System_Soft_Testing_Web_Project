import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { CTA } from "@/components/ui/CTA";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { Reveal } from "@/components/site/Reveal";
import { ProjectFiltersBar } from "@/components/site/ProjectFiltersBar";
import { FolderOpen } from "lucide-react";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import {
  applyFilters,
  deriveFacets,
  getPublicProjects,
  type ProjectFilters,
} from "@/lib/data/projects";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Projects & Case Studies",
    description:
      "Real client work by AJ System Soft Technology: web applications, SaaS platforms, mobile apps, desktop software and industry-specific business systems. Confidential engagements stay private.",
    path: "/projects",
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; industry?: string }>;
}) {
  const params = await searchParams;
  const filters: ProjectFilters = {
    platform: params.platform,
    industry: params.industry,
  };

  const projects = await getPublicProjects();
  const facets = deriveFacets(projects);
  const visible = applyFilters(projects, filters);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Projects", href: "/projects" },
        ]}
        eyebrow="Portfolio"
        title="Projects & case studies"
        description="A selection of the software we have delivered. Confidential engagements stay private by design — clients decide what is shown."
      />
    <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
      <div>
        <ProjectFiltersBar facets={facets} current={filters} resultCount={visible.length} />
      </div>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index, 5) * 60} className="h-full">
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
                priority={index === 0}
                className="h-full"
              />
            </Reveal>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<FolderOpen aria-hidden="true" className="h-6 w-6" />}
            title="Case studies are being prepared"
            description="We publish a project only after the client agrees to make it public. Meanwhile, the services page shows exactly what we can build for you."
            action={
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Button href="/services" variant="secondary">
                  Browse services
                </Button>
                <Button href="/contact">Contact us</Button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No projects match these filters"
            description="Try removing a filter to see more of our work."
            action={
              <Button href="/projects" variant="secondary">
                Clear filters
              </Button>
            }
          />
        </div>
      )}

      <div className="mt-16">
        <CTA
          eyebrow="Your project next"
          title="Have something like this in mind?"
          description="Tell us the requirements — we will show you how we would approach it."
        />
      </div>
    </div>
    </>
  );
}
