import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { CTA } from "@/components/ui/CTA";
import { blogPostingJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/seo/site";
import { COMPARISONS, getComparison } from "@/lib/ai-integrations/comparisons";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getComparison((await params).slug);
  if (!c) return {};
  return buildMetadata({
    title: c.title,
    description: c.description,
    path: `/ai-integrations/compare/${c.slug}`,
    type: "article",
    article: { publishedTime: c.publishedAt, modifiedTime: c.publishedAt, authors: [BRAND.primaryName] },
  });
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getComparison((await params).slug);
  if (!c) notFound();
  const path = `/ai-integrations/compare/${c.slug}`;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "AI Integrations", path: "/ai-integrations" }, { name: c.columns.join(" vs "), path }])} />
      <JsonLd data={blogPostingJsonLd({ title: c.title, description: c.description, path, publishedAt: c.publishedAt, modifiedAt: c.publishedAt, authorName: BRAND.primaryName })} />
      <JsonLd data={faqPageJsonLd(c.faqs)} />
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "AI Integrations", href: "/ai-integrations" }, { name: c.columns.join(" vs "), href: path }]}
        eyebrow="Comparison"
        title={c.title}
        description={c.intro}
      />
      <article className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[600px] text-left text-sm">
            <caption className="sr-only">{c.columns.join(" vs ")} comparison</caption>
            <thead className="bg-canvas">
              <tr>
                <th scope="col" className="p-3">Feature</th>
                {c.columns.map((col) => <th key={col} scope="col" className="p-3">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <th scope="row" className="p-3 font-medium">{row.label}</th>
                  {row.values.map((v, i) => <td key={i} className="p-3 text-ink-soft">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 max-w-3xl space-y-8">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl font-semibold">{s.heading}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{s.body}</p>
            </section>
          ))}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
            <h2 className="text-xl font-semibold">Our verdict</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{c.verdict}</p>
          </section>
        </div>

        <section className="mt-12" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-2xl font-semibold">FAQs</h2>
          <Accordion className="mt-6 max-w-3xl" items={c.faqs.map((f, i) => ({ id: `faq-${i}`, question: f.question, answer: f.answer }))} />
        </section>

        <p className="mt-10 text-sm text-ink-soft">
          Related: <Link href="/ai-integrations" className="underline">all AI tools we integrate</Link>
          {COMPARISONS.filter((o) => o.slug !== c.slug).map((o) => (
            <span key={o.slug}> · <Link href={`/ai-integrations/compare/${o.slug}`} className="underline">{o.columns.join(" vs ")}</Link></span>
          ))}
        </p>
        <p className="mt-4 text-xs text-ink-soft">Product names are trademarks of their owners. Features change often — check each vendor for current details.</p>

        <CTA
          className="mt-12"
          eyebrow="Need help choosing?"
          title="Get a free recommendation for your team"
          description="We set up, integrate and maintain these tools for businesses."
          primary={{ label: "Request a Quote", href: "/request-quote" }}
          secondary={{ label: "Contact Us", href: "/contact" }}
        />
      </article>
    </>
  );
}
