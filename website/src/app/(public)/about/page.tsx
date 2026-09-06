import type { Metadata } from "next";
import { ClipboardList, KeyRound, LifeBuoy, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { CTA } from "@/components/ui/CTA";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GallerySection } from "@/components/site/GallerySection";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/seo/site";
import { getGalleryForPage } from "@/lib/data/sections";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "About Us — The Team Behind AJS Technology",
    description:
      "AJ System Soft Technology (also known as AJS Technology) builds custom software, SaaS platforms, web and mobile apps, desktop software and business systems around each client's requirements.",
    path: "/about",
  });
}

const CAPABILITIES = [
  {
    title: "Custom software & SaaS",
    description:
      "Internal tools, customer portals and complete subscription products — specified from your requirements, not squeezed into a template.",
  },
  {
    title: "Web & mobile applications",
    description:
      "Fast, secure web applications plus Android and iOS apps, whether customer-facing or for field teams.",
  },
  {
    title: "Business & industry systems",
    description:
      "ERP, CRM, POS and inventory systems — and industry software for hospitals, pharmacies, retail counters and hotels.",
  },
] as const;

const PRINCIPLES = [
  {
    Icon: ClipboardList,
    title: "Requirements before code",
    description:
      "We write down what the software must do before we discuss how to build it. Assumptions are the most expensive bug.",
  },
  {
    Icon: KeyRound,
    title: "You own what we build",
    description:
      "Source code, documentation and credentials are yours. No lock-in, no hostage architecture.",
  },
  {
    Icon: ShieldCheck,
    title: "Security by default",
    description:
      "Role-based access, validated inputs and protected data are part of the foundation — not a later add-on.",
  },
  {
    Icon: LifeBuoy,
    title: "Software is a relationship",
    description:
      "Launch is the midpoint, not the finish line. We stay for maintenance, fixes and the features you discover later.",
  },
] as const;

const PROCESS = [
  {
    step: "01",
    title: "Discovery",
    description: "We map the real workflow and agree the requirements in writing.",
  },
  {
    step: "02",
    title: "Plan",
    description: "A clear scope, the right platform and a transparent estimate.",
  },
  {
    step: "03",
    title: "Build",
    description: "Reviewable iterations — you see and click the software as it grows.",
  },
  {
    step: "04",
    title: "Launch",
    description: "Testing, deployment, data migration and team training.",
  },
  {
    step: "05",
    title: "Support",
    description: "Maintenance, fixes and new features as your business grows.",
  },
] as const;

export default async function AboutPage() {
  const gallery = await getGalleryForPage("about");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <JsonLd
        data={aboutPageJsonLd({
          description:
            "AJ System Soft Technology (also known as AJS Technology) builds custom software, SaaS platforms, web and mobile apps, desktop software and business systems around each client's requirements.",
        })}
      />

      <article>
        <PageHero
          crumbs={[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ]}
          eyebrow="About us"
          title={BRAND.primaryName}
          description={BRAND.tagline}
        />

        <section className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
          <Reveal>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-ink-soft sm:text-[17px] [&>p:first-child]:text-lg [&>p:first-child]:font-medium [&>p:first-child]:text-ink sm:[&>p:first-child]:text-xl">
              <p>
                {BRAND.primaryName} is a software development company that builds technology around
                one thing: your requirements. We design and build custom software, SaaS products,
                websites, web applications, ecommerce platforms, Android and iOS apps, Windows
                desktop software, and industry-specific systems such as ERP, CRM, POS and hospital
                software.
              </p>
              <p>
                Most clients simply call us {BRAND.shortName}. Some know us by our founder&rsquo;s
                name — {BRAND.alternateNames[0]} or {BRAND.alternateNames[1]}. They are all the same
                team, with the same approach: understand the work first, then build the software
                around it.
              </p>
              <p>
                We deliberately stay a focused team instead of a body shop. The people who
                understand your requirements are the people who design, build and support your
                software — which is why our systems stay maintainable long after launch.
              </p>
            </div>
          </Reveal>
        </section>

        <section
          className="relative isolate overflow-hidden border-y border-line bg-surface"
          aria-labelledby="approach"
        >
          <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-60" />
          <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
            <Reveal>
              <SectionHeader
                eyebrow="Our approach"
                title={<span id="approach">Custom-requirement development</span>}
                description="No two businesses work the same way, so no two of our systems start from the same page. Your requirements are the specification."
              />
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {CAPABILITIES.map((capability, index) => (
                <Reveal key={capability.title} delay={index * 50} className="h-full">
                  <div className="card-3d h-full rounded-[1.375rem] p-6">
                    <h3 className="relative z-10 text-[17px] font-semibold tracking-tight text-ink">
                      {capability.title}
                    </h3>
                    <p className="relative z-10 mt-2 text-sm leading-relaxed text-ink-muted">
                      {capability.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={100}>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Web apps",
                  "SaaS",
                  "Android",
                  "iOS",
                  "Windows desktop",
                  "ERP",
                  "CRM",
                  "POS",
                  "Inventory",
                  "Hospital software",
                  "Pharmacy software",
                  "Hotel software",
                ].map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft shadow-e1 transition-[transform,border-color,color] duration-200 ease-soft hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16"
          aria-labelledby="process"
        >
          <Reveal>
            <SectionHeader
              eyebrow="Delivery"
              title={<span id="process">How a project runs</span>}
              description="Five predictable stages — you always know what is happening and what comes next."
            />
          </Reveal>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((item, index) => (
              <li key={item.step}>
                <Reveal delay={index * 50} className="h-full">
                  <div className="group card-3d h-full rounded-[1.25rem] p-5">
                    <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-4px_rgba(37,87,232,0.5)] transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-105">
                      {item.step}
                    </span>
                    <h3 className="relative z-10 mt-3 font-semibold tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="relative z-10 mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="relative isolate overflow-hidden border-y border-line bg-surface"
          aria-labelledby="principles"
        >
          <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-80" />
          <div
            aria-hidden="true"
            className="aurora aurora-b -right-32 top-0 -z-10 hidden h-96 w-96 lg:block"
          />
          <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
            <Reveal>
              <SectionHeader
                eyebrow="Principles"
                title={<span id="principles">What we hold the line on</span>}
              />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRINCIPLES.map(({ Icon, title, description }, index) => (
                <Reveal key={title} delay={index * 50} className="h-full">
                  <div className="group card-3d flex h-full flex-col gap-3 rounded-[1.375rem] p-6">
                    <span aria-hidden="true" className="icon-tile relative z-10 h-12 w-12">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="relative z-10 font-semibold tracking-tight text-ink">{title}</h3>
                    <p className="relative z-10 text-sm leading-relaxed text-ink-muted">
                      {description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {gallery ? <GallerySection content={gallery} /> : null}

        <div className="mx-auto w-full max-w-content px-4 py-14 sm:px-6 sm:py-20">
          <CTA
            eyebrow="Work with us"
            title="Let's talk about your requirements."
            description="A short conversation is enough to outline the right platform, scope and plan."
            secondary={{ label: "Meet the team", href: "/team" }}
          />
        </div>
      </article>
    </>
  );
}
