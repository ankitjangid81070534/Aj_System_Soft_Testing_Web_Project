import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Markdown } from "@/components/site/Markdown";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { TERMS_BODY, TERMS_TITLE } from "./terms-content";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Terms of Service",
    description:
      "The terms that govern the use of the AJ System Soft Technology website and the engagement of our software development services.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-narrow px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Terms of Service", href: "/terms" },
        ]}
      />
      <article aria-labelledby="terms-title" className="mt-6 break-words">
        <h1
          id="terms-title"
          className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl"
        >
          {TERMS_TITLE}
        </h1>
        <Markdown content={TERMS_BODY} className="mt-6 text-base leading-7 [&_li]:leading-7" />
      </article>
    </div>
  );
}
