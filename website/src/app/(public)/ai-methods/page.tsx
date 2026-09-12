import type { Metadata } from "next";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { EmptyState } from "@/components/ui/States";
import { getPublicAiMethods } from "@/lib/data/ai-methods";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "AI Methods",
    description: "Explore AI methods and resources shared by AJ System Soft Technology.",
    path: "/ai-methods",
  });
}

export default async function AiMethodsPage() {
  const methods = await getPublicAiMethods();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "AI Methods", path: "/ai-methods" },
      ])} />
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "AI Methods", href: "/ai-methods" }]}
        eyebrow="AI Methods"
        title="Explore AI methods and resources"
        description="Browse the resources shared by AJ System Soft Technology."
      />
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        {methods.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map(method => (
              <article key={method.id} className="card-3d flex flex-col gap-4 rounded-2xl p-6">
                <Sparkles aria-hidden="true" className="h-6 w-6 text-brand-600" />
                <h2 className="text-lg font-semibold text-ink">{method.title}</h2>
                {method.description ? <p className="text-sm leading-relaxed text-ink-muted">{method.description}</p> : null}
                <a href={method.url} target="_blank" rel="noopener noreferrer"
                  className="focus-ring mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-medium text-ink"
                  aria-label={`Open ${method.title} (opens in a new tab)`}>
                  Open resource <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles aria-hidden="true" className="h-6 w-6" />}
            title="No AI resources are available yet"
            description="Published resources will appear here when they are available. Please check back soon."
          />
        )}
      </div>
    </>
  );
}
