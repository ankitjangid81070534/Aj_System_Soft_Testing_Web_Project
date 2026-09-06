import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTA } from "@/components/ui/CTA";
import { Markdown } from "@/components/site/Markdown";
import { getCurrentServiceAgreement, LAWYER_REVIEW_NOTE } from "@/lib/agreements/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/seo/site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const agreement = await getCurrentServiceAgreement();
  return buildMetadata({
    title: agreement ? `${agreement.title} — v${agreement.versionNumber}` : "Service Agreement",
    description:
      "The AJ System Soft Technology service agreement: scope, support, customization, ownership, payment and acceptance terms for every project.",
    path: "/service-agreement",
  });
}

export default async function ServiceAgreementPage() {
  const agreement = await getCurrentServiceAgreement();

  return (
    <div className="mx-auto w-full max-w-narrow px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Service Agreement", href: "/service-agreement" },
        ]}
      />
      <div className="mt-6">
        <SectionHeader
          as="h1"
          eyebrow="Legal"
          title="Service Agreement"
          description={
            agreement
              ? `Current published version v${agreement.versionNumber}. Accepting the agreement during sign-up, contact or a quote request records this exact version as evidence.`
              : "How we work with every client — scope, support and acceptance terms."
          }
        />
      </div>

      {agreement ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-400">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
            <p>
              Version <strong>v{agreement.versionNumber}</strong>
              {agreement.effectiveFrom
                ? ` · effective ${new Date(agreement.effectiveFrom).toLocaleDateString("en-IN", { dateStyle: "long" })}`
                : null}
              {agreement.checksum ? (
                <>
                  {" "}
                  · checksum{" "}
                  <span className="font-mono text-xs">{agreement.checksum.slice(0, 16)}…</span>
                </>
              ) : null}
            </p>
          </div>
          <p className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
            {LAWYER_REVIEW_NOTE}
          </p>
          <div className="mt-10 min-w-0">
            <Markdown content={agreement.body} />
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-line bg-surface px-5 py-6 text-sm text-ink-muted shadow-e1">
          The current service agreement is not published yet. It is shared with every client before
          a project starts — request a copy through the contact page and we will send it right over.
        </p>
      )}

      <div className="mt-16">
        <CTA
          eyebrow="Start a project"
          title={`Build software around your requirements with ${BRAND.shortName}`}
          description="Tell us what you need — we will propose the right platform, a clear plan and a transparent estimate."
          secondary={{ label: "Request a Consultation", href: "/contact" }}
        />
      </div>
    </div>
  );
}
