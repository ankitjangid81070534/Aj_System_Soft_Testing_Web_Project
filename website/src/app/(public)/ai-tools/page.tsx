import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolsExplorer } from "@/components/ai/ToolsExplorer";
import { AI_TOOLS, AI_TOOL_CATEGORIES } from "@/lib/ai/tools";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "AI Tools",
    description: `Use ${AI_TOOLS.length} free in-app AI tools for writing, marketing, SEO, business documents, code and data — built by AJ System Soft Technology.`,
    path: "/ai-tools",
  });
}

export default async function AiToolsPage() {
  const user = isSupabaseConfigured ? await getCurrentUser() : null;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "AI Tools", path: "/ai-tools" },
        ])}
      />
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "AI Tools", href: "/ai-tools" }]}
        eyebrow="AI Tools"
        title={`${AI_TOOLS.length} AI tools that run right here`}
        accent="AI tools"
        scene="nodes"
        tone="purple"
        description={`Writing, marketing, SEO, business documents, code, data, support, career and learning tools across ${AI_TOOL_CATEGORIES.length} categories. Each one runs inside your account — results are private to you.`}
      />
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <ToolsExplorer signedIn={Boolean(user)} />
      </div>
    </>
  );
}
