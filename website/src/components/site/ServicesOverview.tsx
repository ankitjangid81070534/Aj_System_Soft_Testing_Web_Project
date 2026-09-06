import { ServiceCard } from "@/components/ui/ServiceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { renderIcon } from "@/components/site/icons";
import type { ServiceTeaser } from "@/lib/data/mappers";

export function ServicesOverview({ services }: { services: ServiceTeaser[] }) {
  return (
    <section className="relative mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden="true"
        className="aurora aurora-a -left-40 top-20 -z-10 hidden h-96 w-96 lg:block"
      />
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Services"
            title="What we can build for you"
            description="From a single business tool to a complete platform — every engagement starts with your requirements and ends with working software."
          />
          <span className="hidden shrink-0 sm:inline-flex">
            <Button href="/services" variant="outline">
              Explore all services
            </Button>
          </span>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal key={service.id} delay={index * 60} className="h-full">
            <ServiceCard
              title={service.name}
              description={service.shortDescription}
              meta={service.category}
              href={`/services/${service.slug}`}
              icon={renderIcon(service.icon)}
              className="h-full"
            />
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-8 flex justify-center sm:hidden">
          <Button href="/services" variant="outline">
            Explore all services
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
