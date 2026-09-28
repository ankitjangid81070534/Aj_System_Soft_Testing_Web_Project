import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { CTA } from "@/components/ui/CTA";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { GENERAL_FAQS } from "./faq-content";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Frequently Asked Questions",
    description:
      "Answers to common questions about our software development services, timelines, support and code ownership.",
    path: "/faq",
  });
}

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <JsonLd data={faqPageJsonLd(GENERAL_FAQS)} />
      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: "FAQ", href: "/faq" },
        ]}
        eyebrow="FAQ"
        title="Frequently asked questions"
        accent="questions"
        description="Quick answers about how we work, timelines, support and ownership."
      />
      <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <Accordion
            className="max-w-3xl"
            items={GENERAL_FAQS.map((faq, index) => ({
              id: `faq-${index}`,
              question: faq.question,
              answer: faq.answer,
            }))}
          />
        </Reveal>
        <CTA
          className="mt-12"
          eyebrow="Still curious?"
          title="Have a question we didn't answer?"
          description="Talk to our team and get a clear answer for your project."
          primary={{ label: "Request a Quote", href: "/request-quote" }}
          secondary={{ label: "Contact Us", href: "/contact" }}
        />
      </div>
    </>
  );
}
