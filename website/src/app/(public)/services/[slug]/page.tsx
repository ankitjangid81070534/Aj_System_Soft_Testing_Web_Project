import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/ui/CTA";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Reveal } from "@/components/site/Reveal";
import { renderIcon } from "@/components/site/icons";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { getRecentPublicProjects } from "@/lib/data/home";
import type { ProjectTeaser } from "@/lib/data/mappers";
import {
  getServiceBySlug,
  getServiceSlugs,
  getServicesIndex,
  pickRelatedServices,
  pickRelevantProjectIds,
} from "@/lib/data/services";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  // Public routes render blocking (no loading.tsx Suspense boundary above),
  // so notFound() in metadata yields a real 404 status for unknown slugs.
  if (!service) notFound();
  return buildMetadata({
    title: service.seoTitle ?? service.name,
    description: service.seoDescription ?? service.shortDescription,
    path: `/services/${service.slug}`,
    noIndex: service.status !== "published",
  });
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
          >
            <Check className="h-3 w-3" />
          </span>
          <span className="text-sm text-ink-soft">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [allServices, recentProjects] = await Promise.all([
    getServicesIndex(),
    getRecentPublicProjects(6),
  ]);
  const relevantIds = pickRelevantProjectIds<ProjectTeaser>(recentProjects, service);
  const relatedProjects = recentProjects.filter((project) => relevantIds.includes(project.id));
  const relatedServices = pickRelatedServices(allServices, service.slug);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.name, path: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.seoDescription ?? service.shortDescription,
          path: `/services/${service.slug}`,
          industries: service.industries,
        })}
      />
      {service.faqs.length > 0 ? <JsonLd data={faqPageJsonLd(service.faqs)} /> : null}

      <article>
        <PageHero
          crumbs={crumbs.map((crumb) => ({ name: crumb.name, href: crumb.path }))}
          beforeTitle={
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600"
              >
                {renderIcon(service.icon, "h-6 w-6")}
              </span>
              {service.category ? (
                <p className="text-eyebrow font-semibold uppercase tracking-[0.08em] text-brand-600">
                  {service.category}
                </p>
              ) : null}
            </div>
          }
          title={service.name}
          description={service.shortDescription}
        >
          <div className="flex flex-wrap gap-3 pt-1">
            <Button href="/request-quote">Discuss your project</Button>
            <Button href="/projects" variant="secondary">
              See our work
            </Button>
          </div>
        </PageHero>

        {service.longDescription ? (
          <section className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
            <Reveal>
              <div className="max-w-3xl space-y-4 text-base leading-relaxed text-ink-soft">
                {service.longDescription.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {service.problems.length > 0 ? (
          <section className="border-y border-line bg-surface" aria-labelledby="problems-heading">
            <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
              <Reveal>
                <SectionHeader
                  eyebrow="The problem"
                  title={<span id="problems-heading">Business problems this solves</span>}
                  description={`If any of these sound familiar, ${service.name.toLowerCase()} is worth a conversation.`}
                />
              </Reveal>
              <div className="mt-8 max-w-4xl">
                <Reveal delay={80}>
                  <Checklist items={service.problems} />
                </Reveal>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            {service.deliverables.length > 0 ? (
              <div>
                <Reveal>
                  <SectionHeader eyebrow="Deliverables" title="What you receive" />
                </Reveal>
                <div className="mt-6">
                  <Reveal delay={80}>
                    <Checklist items={service.deliverables} />
                  </Reveal>
                </div>
              </div>
            ) : null}
            {service.platforms.length > 0 ? (
              <div>
                <Reveal delay={60}>
                  <SectionHeader eyebrow="Platforms" title="Where it runs" />
                </Reveal>
                <div className="mt-6 flex flex-wrap gap-2">
                  {service.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="rounded-full border border-brand-200/70 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                {service.industries.length > 0 ? (
                  <div className="mt-8">
                    <Reveal delay={100}>
                      <SectionHeader eyebrow="Common in" title="Industries we build this for" />
                    </Reveal>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.industries.map((industry) => (
                        <span
                          key={industry}
                          className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-soft"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {service.features.length > 0 ? (
            <div className="mt-14">
              <Reveal>
                <SectionHeader eyebrow="Capabilities" title="Typical capabilities" />
              </Reveal>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {service.features.map((feature, index) => (
                  <Reveal key={feature} delay={index * 40} className="h-full">
                    <div className="flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-e1">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm text-ink-soft">{feature}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}

          {service.processSteps.length > 0 ? (
            <div className="mt-14">
              <Reveal>
                <SectionHeader eyebrow="Process" title="How we deliver it" />
              </Reveal>
              <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {service.processSteps.map((step, index) => (
                  <li key={step}>
                    <Reveal delay={index * 50} className="h-full">
                      <div className="flex h-full gap-3 rounded-2xl border border-line bg-canvas p-4">
                        <span aria-hidden="true" className="text-sm font-semibold text-brand-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm text-ink-soft">{step}</p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>

        {relatedProjects.length > 0 ? (
          <section className="border-y border-line bg-surface" aria-labelledby="related-work">
            <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
              <Reveal>
                <SectionHeader
                  eyebrow="Related work"
                  title={<span id="related-work">Projects in this space</span>}
                />
              </Reveal>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((project, index) => (
                  <Reveal key={project.id} delay={index * 60} className="h-full">
                    <ProjectCard
                      name={project.name}
                      href={`/projects/${project.slug}`}
                      coverUrl={project.coverUrl}
                      clientName={project.clientName}
                      industry={project.industry}
                      platformType={project.platformType}
                      summary={project.summary}
                      className="h-full"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {service.faqs.length > 0 ? (
          <section
            className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16"
            aria-labelledby="faq-heading"
          >
            <Reveal>
              <SectionHeader eyebrow="FAQ" title={<span id="faq-heading">Common questions</span>} />
            </Reveal>
            <Reveal delay={80}>
              <Accordion
                className="mt-6 max-w-3xl"
                items={service.faqs.map((faq, index) => ({
                  id: `faq-${index}`,
                  question: faq.question,
                  answer: faq.answer,
                }))}
              />
            </Reveal>
          </section>
        ) : null}

        {relatedServices.length > 0 ? (
          <section className="border-t border-line bg-surface" aria-labelledby="related-services">
            <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
              <Reveal>
                <SectionHeader
                  eyebrow="Keep exploring"
                  title={<span id="related-services">Related services</span>}
                />
              </Reveal>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedServices.map((related, index) => (
                  <Reveal key={related.id} delay={index * 50} className="h-full">
                    <ServiceCard
                      title={related.name}
                      description={related.shortDescription}
                      href={`/services/${related.slug}`}
                      icon={renderIcon(related.icon)}
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
            title={`Need ${service.name.toLowerCase()} for your business?`}
            description="Tell us your requirements — we will respond with a practical plan and a transparent estimate."
          />
        </div>
      </article>
    </>
  );
}
