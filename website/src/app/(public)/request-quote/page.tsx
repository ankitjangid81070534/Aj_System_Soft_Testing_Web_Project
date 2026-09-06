import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { QuoteForm } from "@/components/site/LeadForms";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Request a Quote",
    description:
      "Tell AJ System Soft Technology your software requirements — project type, platform, industry and scope — and receive a practical plan with a transparent estimate.",
    path: "/request-quote",
  });
}

// The spam time-trap needs a fresh per-request timestamp.
export const dynamic = "force-dynamic";

export default function RequestQuotePage() {
  // eslint-disable-next-line react-hooks/purity -- server-rendered per request; the timestamp feeds the spam time-trap
  const startedAt = Date.now();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Request a Quote", path: "/request-quote" },
        ])}
      />
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Request a Quote", href: "/request-quote" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <SectionHeader
            as="h1"
            eyebrow="Start your project"
            title="Request a quote"
            description={`Tell us what you need — ${BRAND.shortName} replies with a practical plan, the right platform and a transparent estimate. Only the marked fields are required; the rest help us prepare a sharper first response.`}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-line bg-surface p-6 shadow-e1 sm:p-8">
          <QuoteForm startedAt={startedAt} />
        </div>
      </div>
    </>
  );
}
