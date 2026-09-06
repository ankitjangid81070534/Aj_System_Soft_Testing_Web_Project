import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How AJ System Soft Technology collects, uses and protects the information you share through our contact and quote forms.",
  path: "/privacy",
});

const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "When you use our contact, quote or consultation forms we collect exactly what you type: your name, email address and optionally your phone number, company, location and the project details you choose to share. If you attach a file to a quote request, we store that file privately.",
      "We do not buy data about you or add you to marketing lists. Basic, anonymous technical information (such as pages requested, approximate region, browser type and referring page) is processed by our hosting provider to serve the site securely and to keep it fast.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "The site itself sets only strictly necessary cookies: a session cookie when a client signs in to the client portal, and a small preference stored in your browser to remember the light or dark theme you chose. These are not used for tracking and are never shared with anyone.",
      "Third-party advertising partners (described below) may set their own cookies. You can delete or block cookies at any time in your browser settings; the public pages of this site keep working without them.",
    ],
  },
  {
    title: "Advertising (Google AdSense)",
    body: [
      "This site uses Google AdSense, an advertising service provided by Google LLC, to display advertisements. Google, as a third-party vendor, uses cookies — including the DoubleClick DART cookie — to serve ads based on your visit to this site and to other sites on the internet. Google may also use web beacons and similar technologies to measure ad performance.",
      "Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this site and/or other sites. You may opt out of personalised advertising by visiting Google Ads Settings at https://www.google.com/settings/ads, or opt out of a third-party vendor's use of cookies for personalised advertising at https://www.aboutads.info/choices/ (US) or https://www.youronlinechoices.eu/ (EU).",
      "Where required by law (for example for visitors in the EEA, the UK or Switzerland), a consent message is shown before any personalised advertising cookies are set, and you can change your choice at any time from the link at the bottom of the page. For details of how Google handles data in its advertising products see https://policies.google.com/technologies/partner-sites.",
    ],
  },
  {
    title: "Third-party services we rely on",
    body: [
      "Supabase (database, authentication and private file storage), Vercel (hosting and content delivery), Resend (transactional email for enquiry notifications) and Google (AdSense advertising and Search Console indexing diagnostics). Each processes data under its own privacy terms and only to the extent needed to run this website.",
    ],
  },
  {
    title: "Children",
    body: [
      "Our services are directed at businesses and professionals. We do not knowingly collect personal information from anyone under the age of 18. If you believe a minor has submitted information through our forms, contact us and we will delete it.",
    ],
  },
  {
    title: "Why we collect it",
    body: [
      "The only purpose is to respond to your enquiry: to understand your requirements, reply with questions or a proposal, and (if we work together) to deliver and support the project. The legal basis is your consent, given when you submit the form.",
    ],
  },
  {
    title: "Where it is stored and who can see it",
    body: [
      "Submissions are stored in our Supabase database with row-level security enabled. Only authorised team members (admins and super admins) can read them, and every access-relevant change is recorded in an audit log. Attachments live in a private storage bucket that the public cannot access.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Enquiries we never engage with are deleted within 12 months. Records related to delivered projects are kept for the duration of the support relationship and as needed for accounting.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You can ask us to show, correct or delete anything we hold about you — write to us through the contact form and we will act within a reasonable time. You can withdraw consent for future contact at any time.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "If this policy changes materially, we will update this page and adjust the date below. The form consent text always describes the current practice.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-narrow px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Privacy Policy", href: "/privacy" },
        ]}
      />
      <div className="mt-6">
        <SectionHeader
          as="h1"
          eyebrow="Legal"
          title="Privacy Policy"
          description="Plain language, because privacy text you cannot understand protects no one."
        />
      </div>
      <p className="mt-4 text-xs text-ink-muted">Last updated: 4 September 2026</p>

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
        <section>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Questions about this policy? Use the{" "}
            <a
              href="/contact"
              className="font-medium text-brand-600 hover:text-brand-700 focus-ring rounded-sm"
            >
              contact page
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-12 rounded-xl border border-line bg-canvas p-4 text-xs text-ink-muted">
        This policy describes the site as built. Have it reviewed by legal counsel familiar with
        your jurisdiction (for India: the DPDP Act, 2023) before relying on it commercially.
      </p>
    </div>
  );
}
