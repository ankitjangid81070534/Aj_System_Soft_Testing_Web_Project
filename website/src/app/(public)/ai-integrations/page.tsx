import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { CTA } from "@/components/ui/CTA";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/env";
import { AI_CATALOG, AI_CATALOG_TOOL_COUNT } from "@/lib/ai-integrations/catalog";
import { AI_INTEGRATION_SERVICES } from "@/lib/ai-integrations/services";
import { COMPARISONS } from "@/lib/ai-integrations/comparisons";

const PATH = "/ai-integrations";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "AI Integrations — ChatGPT, Claude, Gemini, n8n & 100+ AI Tools",
    description:
      "How AJS integrates ChatGPT, Claude, Gemini, n8n, Make, ElevenLabs, LangChain and 100+ AI tools into business software — AI development company in India.",
    path: PATH,
  });
}

function itemListJsonLd() {
  let position = 0;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI tools and platforms AJS integrates",
    url: new URL(PATH, siteUrl).toString(),
    itemListElement: AI_CATALOG.flatMap((category) =>
      category.tools.map((tool) => ({
        "@type": "ListItem",
        position: ++position,
        name: tool.name,
        description: tool.note,
        ...(tool.href ? { url: new URL(tool.href, siteUrl).toString() } : {}),
      })),
    ),
  };
}

export default function AiIntegrationsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "AI Integrations", path: PATH }])} />
      <JsonLd data={itemListJsonLd()} />
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "AI Integrations", href: PATH }]}
        eyebrow="AI Integrations"
        title="AI tools we integrate into your business"
        accent="integrate"
        description={`${AI_CATALOG_TOOL_COUNT}+ AI models, coding assistants, automation platforms, chatbots and voice tools — and how we use each one to build practical software for our clients.`}
      />

      <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeader eyebrow="Services" title="AI integration services" description="Dedicated pages with use cases, process, FAQs and a quick enquiry form." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_INTEGRATION_SERVICES.map((service) => (
            <Link key={service.slug} href={`${PATH}/${service.slug}`} className="rounded-2xl border border-line bg-surface p-5 shadow-e1 transition hover:-translate-y-0.5">
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">{service.description}</p>
            </Link>
          ))}
        </div>

        <nav aria-label="AI tool categories" className="mt-14 flex flex-wrap gap-2">
          {AI_CATALOG.map((category) => (
            <a key={category.id} href={`#${category.id}`} className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-soft">
              {category.title}
            </a>
          ))}
        </nav>

        {AI_CATALOG.map((category) => (
          <section key={category.id} id={category.id} className="mt-14 scroll-mt-28" aria-labelledby={`${category.id}-h`}>
            <Reveal>
              <h2 id={`${category.id}-h`} className="text-2xl font-semibold">{category.title}</h2>
              <p className="mt-2 text-ink-soft">{category.intro}</p>
            </Reveal>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => (
                <li key={tool.name} className="rounded-2xl border border-line bg-canvas p-4">
                  <h3 className="font-semibold">
                    {tool.href ? <Link href={tool.href} className="hover:underline">{tool.name} →</Link> : tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{tool.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-16" aria-labelledby="compare-h">
          <h2 id="compare-h" className="text-2xl font-semibold">AI tool comparisons</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {COMPARISONS.map((c) => (
              <li key={c.slug}>
                <Link href={`${PATH}/compare/${c.slug}`} className="block rounded-2xl border border-line bg-surface p-5 shadow-e1">
                  <span className="font-semibold">{c.title}</span>
                  <p className="mt-2 text-sm text-ink-soft">{c.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-xs text-ink-soft">
          All product names and trademarks belong to their respective owners. AJ System Soft Technology is an independent
          software company and is not affiliated with or endorsed by these vendors.
        </p>

        <CTA
          className="mt-12"
          eyebrow="Build with AI"
          title="Want AI working inside your business software?"
          description="Tell us your use case — we will suggest the right tools and a practical plan."
          primary={{ label: "Request a Quote", href: "/request-quote" }}
          secondary={{ label: "Contact Us", href: "/contact" }}
        />
      </div>
    </>
  );
}
