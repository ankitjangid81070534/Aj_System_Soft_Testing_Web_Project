import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { CTA } from "@/components/ui/CTA";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/site/LeadForms";
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { AI_INTEGRATION_SERVICES, getAiIntegrationService } from "@/lib/ai-integrations/services";

// Same as /services/[slug]: re-render every 5 min so the form timestamp stays
// well inside the lead spam guard's 1-hour max age.
export const revalidate = 300;
export const dynamicParams = false;

/** Spam-guard timestamp for the inline form (per request). */
function formStartedAt() {
  return Date.now();
}

export function generateStaticParams() {
  return AI_INTEGRATION_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = getAiIntegrationService((await params).slug);
  if (!service) return {};
  return buildRouteMetadata({ title: service.title, description: service.description, path: `/ai-integrations/${service.slug}` });
}

export default async function AiIntegrationServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getAiIntegrationService((await params).slug);
  if (!service) notFound();
  const path = `/ai-integrations/${service.slug}`;
  const others = AI_INTEGRATION_SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "AI Integrations", path: "/ai-integrations" }, { name: service.name, path }])} />
      <JsonLd data={serviceJsonLd({ name: service.name, description: service.description, path })} />
      <JsonLd data={faqPageJsonLd(service.faqs)} />
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "AI Integrations", href: "/ai-integrations" }, { name: service.name, href: path }]}
        eyebrow="AI Integration"
        title={service.title}
        description={service.intro}
      />
      <article>
        <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
          <ul className="flex flex-wrap gap-2" aria-label="Tools and platforms">
            {service.tools.map((tool) => (
              <li key={tool} className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-soft">{tool}</li>
            ))}
          </ul>

          <section className="mt-12" aria-labelledby="uses-h">
            <h2 id="uses-h" className="text-2xl font-semibold">What we build</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {service.useCases.map((u) => (
                <div key={u.title} className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
                  <h3 className="font-semibold">{u.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{u.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12" aria-labelledby="process-h">
            <h2 id="process-h" className="text-2xl font-semibold">How we deliver</h2>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {service.process.map((step, i) => (
                <li key={step} className="rounded-2xl border border-line bg-canvas p-4 text-sm text-ink-soft">
                  <span className="block text-xs font-semibold text-brand-700">Step {i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-2xl font-semibold">Frequently asked questions</h2>
            <Accordion
              className="mt-6 max-w-3xl"
              items={service.faqs.map((faq, i) => ({ id: `faq-${i}`, question: faq.question, answer: faq.answer }))}
            />
          </section>
        </div>

        <section id="ask" className="border-t border-line" aria-labelledby="ask-heading">
          <div className="mx-auto grid w-full max-w-content gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeader
              eyebrow="Quick question?"
              title={<span id="ask-heading">Ask about {service.name}</span>}
              description="Send a short message — we usually reply within one business day, by email or WhatsApp."
            />
            <ContactForm startedAt={formStartedAt()} service={service.name} />
          </div>
        </section>

        <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold">More AI integration services</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={`/ai-integrations/${s.slug}`} className="inline-block rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-soft">{s.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/ai-integrations" className="inline-block rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-soft">All 100+ AI tools →</Link>
            </li>
          </ul>
          <CTA
            className="mt-12"
            eyebrow="Start a project"
            title={`Need ${service.name} for your business?`}
            description="Tell us your requirements — we will respond with a practical plan and a transparent estimate."
          />
        </div>
      </article>
    </>
  );
}
