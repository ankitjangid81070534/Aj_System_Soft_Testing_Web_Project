import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Quote } from "lucide-react";
import { ProjectGallery } from "@/components/site/ProjectGallery";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/ui/CTA";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { getPublicProjects, getProjectCaseStudy, getProjectSlugs } from "@/lib/data/projects";
import { pickRelevantProjectIds } from "@/lib/data/services";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectCaseStudy(slug);
  // notFound() throws a control-flow signal, so it must stay outside the
  // try/catch below. It yields a real 404 status for unknown slugs.
  if (!project) notFound();
  try {
    return buildMetadata({
      title: project.name || "Case study",
      description: project.summary || "Project case study",
      path: `/projects/${project.slug || slug}`,
      noIndex: project.status !== "published",
    });
  } catch (error) {
    console.error(`[projects/${slug}] metadata failed`, error);
    return { title: project.name || "Case study", description: project.summary || "Project case study" };
  }
}

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-[0.06em] text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function TextSection({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <section className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 sm:py-10">
      <Reveal>
        <div className="max-w-3xl">
          <h2 className="text-display-sm font-semibold tracking-tight text-ink">{title}</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft">
            {text.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectCaseStudy(slug);
  if (!project) notFound();

  // Defensive defaults: a partial CMS row must never crash the render.
  const name = project.name || "Case study";
  const projectSlug = project.slug || slug;
  const keyFeatures = project.keyFeatures ?? [];
  const technologyStack = project.technologyStack ?? [];
  const integrations = project.integrations ?? [];
  const impactResults = project.impactResults ?? [];
  const gallery = (project.gallery ?? []).filter((media) => Boolean(media?.url));

  const allProjects = (await getPublicProjects()) ?? [];
  const relatedIds = pickRelevantProjectIds(
    allProjects.filter((item) => item.id !== project.id),
    {
      industries: project.industry ? [project.industry] : [],
      platforms: project.platformType ? [project.platformType] : [],
    },
  );
  const related = allProjects.filter((item) => relatedIds.includes(item.id)).slice(0, 3);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: name, path: `/projects/${projectSlug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <article>
        <PageHero
          crumbs={crumbs.map((crumb) => ({ name: crumb.name, href: crumb.path }))}
          beforeTitle={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">
                {project.status === "published" ? "Case study" : project.status}
              </Badge>
              {project.isFeatured ? <Badge tone="success">Featured</Badge> : null}
              {project.platformType ? <Badge>{project.platformType}</Badge> : null}
              {project.industry ? <Badge>{project.industry}</Badge> : null}
            </div>
          }
          title={name}
          description={project.summary}
          aside={
            <aside className="rounded-2xl border border-line bg-canvas p-5">
              <h2 className="text-sm font-semibold text-ink">Project overview</h2>
              <dl className="mt-2">
                <MetaRow
                  label="Client"
                  value={project.clientName ?? "Not publicly listed"}
                />
                <MetaRow label="Industry" value={project.industry} />
                <MetaRow label="Platform" value={project.platformType} />
                <MetaRow label="Duration" value={project.duration} />
                <MetaRow
                  label="Year"
                  value={project.projectYear ? String(project.projectYear) : null}
                />
                <MetaRow label="Status" value={project.projectStatus} />
              </dl>
            </aside>
          }
        >
          <div className="flex flex-wrap gap-3 pt-1">
            <Button href="/request-quote">Start a similar project</Button>
            {project.publicUrl ? (
              <Button href={project.publicUrl} variant="secondary" target="_blank">
                Visit live product
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </PageHero>

        {project.coverUrl ? (
          <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
            <Reveal>
              <MediaFrame
                src={project.coverUrl}
                alt={`${name} — main interface preview`}
                label={name}
                aspect="16/9"
                priority
                className="max-w-5xl"
              />
            </Reveal>
          </div>
        ) : null}

        <div className="border-y border-line bg-surface">
          <TextSection title="Overview" text={project.overview} />
          <TextSection title="The challenge" text={project.problem} />
          <TextSection title="Our solution" text={project.solution} />
        </div>

        {keyFeatures.length > 0 ? (
          <section
            className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14"
            aria-labelledby="features"
          >
            <Reveal>
              <SectionHeader
                eyebrow="Capabilities"
                title={<span id="features">Key features</span>}
              />
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {keyFeatures.map((feature, index) => (
                <Reveal key={feature} delay={index * 40} className="h-full">
                  <div className="h-full rounded-2xl border border-line bg-surface p-4 shadow-e1">
                    <p className="text-sm text-ink-soft">{feature}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {technologyStack.length > 0 ||
        project.databaseNote ||
        integrations.length > 0 ? (
          <section className="border-y border-line bg-surface" aria-labelledby="stack">
            <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
              <Reveal>
                <SectionHeader
                  eyebrow="Under the hood"
                  title={<span id="stack">Technology stack</span>}
                />
              </Reveal>
              <div className="mt-6 flex flex-col gap-5">
                {technologyStack.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {technologyStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-soft"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}
                {project.databaseNote ? (
                  <p className="max-w-3xl text-sm text-ink-muted">
                    <span className="font-medium text-ink">Data layer: </span>
                    {project.databaseNote}
                  </p>
                ) : null}
                {integrations.length > 0 ? (
                  <p className="max-w-3xl text-sm text-ink-muted">
                    <span className="font-medium text-ink">Integrations: </span>
                    {integrations.join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <ProjectGallery name={name} gallery={gallery} videoUrl={project.videoUrl} />

        {impactResults.length > 0 ? (
          <section className="border-y border-line bg-surface" aria-labelledby="results">
            <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
              <Reveal>
                <SectionHeader eyebrow="Outcomes" title={<span id="results">Real results</span>} />
              </Reveal>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {impactResults.map((result) => (
                  <li
                    key={result}
                    className="rounded-2xl border border-success/20 bg-success-soft p-4 text-sm text-ink-soft"
                  >
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {project.testimonial ? (
          <section className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
            <Reveal>
              <figure className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-6 shadow-e2 sm:p-8">
                <Quote aria-hidden="true" className="h-7 w-7 text-brand-300" />
                <blockquote className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                  {project.testimonial.quote || null}
                </blockquote>
                <figcaption className="mt-4 border-t border-line pt-4 text-sm">
                  <span className="font-semibold text-ink">
                    {project.testimonial.person ?? project.clientName}
                  </span>
                  {project.testimonial.role ? (
                    <span className="text-ink-muted"> · {project.testimonial.role}</span>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="border-y border-line bg-surface" aria-labelledby="related">
            <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
              <Reveal>
                <SectionHeader
                  eyebrow="Related work"
                  title={<span id="related">More projects like this</span>}
                />
              </Reveal>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item, index) => (
                  <Reveal key={item.id} delay={index * 60} className="h-full">
                    <ProjectCard
                      name={item.name}
                      href={`/projects/${item.slug}`}
                      coverUrl={item.coverUrl}
                      clientName={item.clientName}
                      industry={item.industry}
                      platformType={item.platformType}
                      summary={item.summary}
                      className="h-full"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="mx-auto w-full max-w-content px-4 py-14 sm:px-6 sm:py-20">
          <CTA
            eyebrow="Start a project"
            title="Want results like these?"
            description="Share your requirements — we will respond with a practical plan, the right platform and a transparent estimate."
          />
        </div>
      </article>
    </>
  );
}
