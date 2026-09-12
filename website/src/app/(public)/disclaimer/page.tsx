import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { buildRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Legal Disclaimer",
    description:
      "AJ System Soft Technology's disclaimer regarding custom digital services and client operations after project delivery.",
    path: "/disclaimer",
  });
}

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-narrow px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Disclaimer", href: "/disclaimer" },
        ]}
      />
      <article aria-labelledby="disclaimer-title" className="mt-6 break-words text-base leading-7 text-ink-soft">
        <h1
          id="disclaimer-title"
          className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl"
        >
          Legal Disclaimer
        </h1>
        <p className="mt-6">
          The information and custom digital services provided by AJ System Soft Technology are
          engineered around custom business workflows on an &quot;as-is&quot; and &quot;as-available&quot; basis.
        </p>
        <section aria-labelledby="client-operations-title" className="mt-10">
          <h2 id="client-operations-title" className="text-2xl font-semibold leading-tight tracking-tight text-ink">
            No Liability for Client Operations
          </h2>
          <p className="mt-4">
            AJ System Soft Technology does not monitor, control, or take responsibility for how
            clients deploy, host, or execute the software products after project delivery. We
            explicitly disclaim all liability for any direct, indirect, incidental, or
            consequential damages or legal penalties resulting from the misuse, illegal setup,
            or fraudulent applications of our custom-developed systems by the client or end-users.
          </p>
          <p className="mt-4">
            Clients are strictly advised to operate their delivered web apps and platforms within
            the bounds of information technology laws and regional compliance rules.
          </p>
        </section>
      </article>
    </div>
  );
}
