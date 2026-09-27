import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolPageRunner } from "@/components/ai/ToolPageRunner";
import { findTool } from "@/lib/ai/tools";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { breadcrumbJsonLd, ORGANIZATION_ID } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ toolId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = findTool((await params).toolId);
  if (!tool) return {};
  return buildRouteMetadata({
    title: `Free AI ${tool.name} — ${tool.category} AI Tool`,
    description: `${tool.description} Free online AI ${tool.name.toLowerCase()} by AJ System Soft Technology — fast, private and easy to use.`,
    path: `/ai-tools/${tool.id}`,
  });
}

export default async function AiToolPage({ params }: Props) {
  const tool = findTool((await params).toolId);
  if (!tool) notFound();
  const user = isSupabaseConfigured ? await getCurrentUser() : null;
  const path = `/ai-tools/${tool.id}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "AI Tools", path: "/ai-tools" },
          { name: tool.name, path },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: `AI ${tool.name}`,
          description: tool.description,
          url: new URL(path, siteUrl).toString(),
          applicationCategory: "BusinessApplication",
          applicationSubCategory: `${tool.category} AI tool`,
          operatingSystem: "Web browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          publisher: { "@id": ORGANIZATION_ID() },
        }}
      />
      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: "AI Tools", href: "/ai-tools" },
          { name: tool.name, href: path },
        ]}
        eyebrow={`${tool.category} AI`}
        title={`AI ${tool.name}`}
        accent={tool.name}
        scene="nodes"
        tone="purple"
        description={tool.description}
      />
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <ToolPageRunner toolId={tool.id} signedIn={Boolean(user)} />
      </div>
    </>
  );
}
