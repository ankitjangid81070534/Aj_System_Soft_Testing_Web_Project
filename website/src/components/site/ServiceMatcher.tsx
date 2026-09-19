import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceCardModel } from "@/lib/data/services";
import { matchServices, SERVICE_GOALS } from "@/lib/service-matcher";
import { renderIcon } from "./icons";

/** Native disclosures keep guidance usable before hydration and without JavaScript. */
export function ServiceMatcher({ services }: { services: ServiceCardModel[] }) {
  return (
    <section
      id="service-matcher"
      aria-labelledby="service-matcher-heading"
      className="mb-16 scroll-mt-28 rounded-3xl border border-line bg-surface p-5 shadow-e2 sm:p-8"
    >
      <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
        Service matcher
      </p>
      <h2 id="service-matcher-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
        What would you like to build?
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Choose the closest goal to see relevant service pages. This is a starting point, not a
        fixed scope or quote. You can change your choice or browse the full list below.
      </p>
      <div className="mt-6 grid items-start gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_GOALS.map((goal) => {
          const matches = matchServices(services, goal.id);
          return (
            <details
              key={goal.id}
              name="service-goal"
              data-service-goal={goal.id}
              className="min-w-0 rounded-2xl border border-line bg-canvas open:border-brand-400 open:shadow-e1"
            >
              <summary className="min-h-14 cursor-pointer rounded-2xl p-4 text-sm font-semibold text-ink marker:text-brand-600 focus-ring">
                <span className="ml-1 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-3 align-middle">
                  <span aria-hidden="true" className="shrink-0 text-brand-600 dark:text-brand-400">
                    {renderIcon(goal.icon)}
                  </span>
                  {goal.label}
                </span>
              </summary>
              <div className="border-t border-line px-4 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-ink-muted">{goal.guidance}</p>
                {matches.length ? (
                  <ul className="mt-3 space-y-1" aria-label={`Services for ${goal.label.toLowerCase()}`}>
                    {matches.map((service) => (
                      <li key={service.id}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="flex min-h-11 items-center justify-between gap-2 rounded-lg py-2 text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 focus-ring dark:text-brand-400"
                        >
                          {service.name}
                          <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    {goal.id !== "unsure" ? (
                      <p className="mt-3 text-sm text-ink-muted">
                        No matching service page is currently listed. Browse the available services
                        or tell us what you need.
                      </p>
                    ) : null}
                    <Link
                      href="/request-quote"
                      className="mt-3 inline-flex min-h-11 items-center rounded-lg py-2 text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400"
                    >
                      Discuss your requirements
                    </Link>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>
      <Link
        href="#service-catalogue"
        className="mt-4 inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400"
      >
        Browse all services
      </Link>
    </section>
  );
}
