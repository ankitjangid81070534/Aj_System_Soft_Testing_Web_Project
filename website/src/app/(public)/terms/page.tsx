import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description:
    "The terms that govern the use of the AJ System Soft Technology website and the engagement of our software development services.",
  path: "/terms",
});

const SECTIONS = [
  {
    title: "About these terms",
    body: [
      "These terms cover the use of this website and the general basis on which AJ System Soft Technology provides software development services. Project-specific agreements (statements of work, proposals or contracts) take precedence over anything written here.",
    ],
  },
  {
    title: "Quotes and estimates",
    body: [
      "Estimates provided through this site or in conversation are indicative until a written scope is agreed. A binding engagement begins only when both parties sign a proposal or statement of work that defines scope, timeline and price.",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "Upon full payment, clients own the source code, documentation and other deliverables created specifically for their project. We retain the right to reuse general know-how, internal tooling and non-project-specific patterns. Pre-existing third-party components remain under their own licences.",
    ],
  },
  {
    title: "Confidentiality",
    body: [
      "Client requirements, business data and project materials are treated as confidential. We publish case studies only with explicit client permission, and confidential engagements are never referenced publicly.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Payment schedules are defined in each statement of work. Any payment links published on this site point to external, secured payment gateways; we never collect or store card details on this website.",
    ],
  },
  {
    title: "Warranty and liability",
    body: [
      "Delivered software is covered by the support window defined in its statement of work, during which defects in the agreed scope are fixed without charge. To the maximum extent permitted by law, our liability for any claim is limited to the fees paid for the affected deliverable, and we are not liable for indirect or consequential losses.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "You agree not to misuse this website: no attempts to breach authentication, no automated scraping that degrades the service, no submission of unlawful content through our forms, and no misrepresentation of your identity.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of India, with courts in the location of our principal place of business having jurisdiction, unless a signed project agreement states otherwise.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-narrow px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Terms & Conditions", href: "/terms" },
        ]}
      />
      <div className="mt-6">
        <SectionHeader
          as="h1"
          eyebrow="Legal"
          title="Terms & Conditions"
          description="The short version: we agree on scope in writing, you own what you pay for, and we keep your information confidential."
        />
      </div>
      <p className="mt-4 text-xs text-ink-muted">Last updated: 30 August 2026</p>

      <div className="mt-10 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-sm leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-xl border border-line bg-canvas p-4 text-xs text-ink-muted">
        These terms describe the site and engagement model as built. Have them reviewed by legal
        counsel before relying on them commercially.
      </p>
    </div>
  );
}
