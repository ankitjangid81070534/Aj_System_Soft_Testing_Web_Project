import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { ServiceMatcher } from "@/components/site/ServiceMatcher";
import { SolutionComparison } from "@/components/site/SolutionComparison";
import { SectionJumpLink } from "@/components/site/SectionJumpLink";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { CTA } from "@/components/ui/CTA";
import { Reveal } from "@/components/site/Reveal";
import { renderIcon } from "@/components/site/icons";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { getServicesIndex } from "@/lib/data/services";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Services — Custom Software, SaaS, Web, Mobile & Business Systems",
    description:
      "Software development services: custom software, SaaS platforms, web applications, websites, ecommerce, Android and iOS apps, desktop software, ERP, POS and industry-specific systems.",
    path: "/services",
  });
}

function categoryId(category: string): string {
  return `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export default async function ServicesPage() {
  const services = await getServicesIndex();
  const categories = [...new Set(services.map((service) => service.category))];

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
        eyebrow="Services"
        title="Software services built around your requirements"
        description="Pick the closest match below — or simply tell us your problem and we will propose the right approach. Every engagement starts with your requirements, not our price list."
      >
        <Link
          href="#service-matcher"
          className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400"
        >
          Not sure? Find a service for your project
        </Link>
        <SectionJumpLink
          id="solution-comparison"
          className="ml-0 inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring sm:ml-6 dark:text-brand-400"
        >
          Compare solution approaches
        </SectionJumpLink>
        {categories.length > 1 ? (
          <nav aria-label="Service categories" className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`#${categoryId(category)}`}
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft shadow-e1 transition-[transform,border-color,color,box-shadow] duration-200 ease-soft hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-e2 focus-ring dark:hover:text-brand-400"
              >
                {category}
                <span className="ml-2 text-xs text-ink-muted">
                  ({services.filter((service) => service.category === category).length})
                </span>
              </Link>
            ))}
          </nav>
        ) : null}
      </PageHero>

      <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
        <ServiceMatcher services={services} />
        <SolutionComparison services={services} />
        <div id="service-catalogue" className="flex scroll-mt-28 flex-col gap-16">
          {services.length === 0 ? (
            <p className="text-ink-muted">
              No services are currently listed. You can still discuss your requirements below.
            </p>
          ) : null}
          {categories.map((category, categoryIndex) => {
            const categoryServices = services.filter((service) => service.category === category);
            if (categoryServices.length === 0) return null;
            const id = categoryId(category);
            return (
              <section key={category} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28">
                <Reveal>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_14px_-4px_rgba(37,87,232,0.5)]"
                    >
                      {String(categoryIndex + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`${id}-heading`}
                      className="text-xl font-bold tracking-tight text-ink sm:text-2xl"
                    >
                      {category}
                    </h2>
                    <span aria-hidden="true" className="divider-glow ml-2 hidden flex-1 sm:block" />
                  </div>
                </Reveal>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryServices.map((service, index) => (
                    <Reveal key={service.id} delay={index * 50} className="h-full">
                      <ServiceCard
                        title={service.name}
                        description={service.shortDescription}
                        href={`/services/${service.slug}`}
                        icon={renderIcon(service.icon)}
                        className="h-full"
                      />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-20">
          <CTA
            eyebrow="Not sure where to start?"
            title="Describe the problem — we will propose the solution."
            description="A short conversation is usually enough to outline the right platform, scope and plan."
            primary={{ label: "Request a Quote", href: "/request-quote" }}
            secondary={{ label: "View Projects", href: "/projects" }}
          />
        </div>
      </div>
    </>
  );
}
