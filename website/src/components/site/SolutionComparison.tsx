import Link from "next/link";
import type { ServiceCardModel } from "@/lib/data/services";
import { getComparisonServices, SOLUTION_COMPARISONS } from "@/lib/solution-comparison";

/** Native disclosures work before hydration and without JavaScript. No answers are collected. */
export function SolutionComparison({ services }: { services: ServiceCardModel[] }) {
  return (
    <section
      id="solution-comparison"
      aria-labelledby="solution-comparison-heading"
      className="mb-16 scroll-mt-28 rounded-3xl border border-line bg-surface p-5 shadow-e2 sm:p-8"
    >
      <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
        Compare approaches
      </p>
      <h2 id="solution-comparison-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
        Which solution fits your workflow?
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Compare typical uses and trade-offs before choosing a platform. This is general guidance,
        not a fixed scope, price or delivery promise. Your requirements decide the fit.
      </p>
      <div className="mt-6 space-y-3">
        {SOLUTION_COMPARISONS.map((comparison) => {
          const matches = getComparisonServices(services, comparison.id);
          return (
            <details
              key={comparison.id}
              name="solution-comparison"
              data-solution-comparison={comparison.id}
              className="min-w-0 rounded-2xl border border-line bg-canvas open:border-brand-400 open:shadow-e1"
            >
              <summary className="min-h-14 cursor-pointer rounded-2xl p-4 text-sm font-semibold text-ink marker:text-brand-600 focus-ring">
                {comparison.title}
              </summary>
              <div className="border-t border-line p-4 sm:p-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {comparison.options.map((option) => (
                    <div key={option.name} className="min-w-0">
                      <h3 className="text-base font-semibold text-ink">{option.name}</h3>
                      <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                        <div>
                          <dt className="font-semibold text-ink-soft">Useful when</dt>
                          <dd className="mt-1 text-ink-muted">{option.fit}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-ink-soft">Plan for</dt>
                          <dd className="mt-1 text-ink-muted">{option.consideration}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
                <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
                  <strong>Ask first: </strong>{comparison.question}
                </p>
                {matches.length ? (
                  <ul aria-label={`Related services: ${comparison.title}`} className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                    {matches.map((service) => (
                      <li key={service.id}>
                        <Link href={`/services/${service.slug}`} className="inline-flex min-h-11 items-center rounded-lg py-2 text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400">
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">No related service page is currently listed. You can still discuss your workflow below.</p>
                )}
              </div>
            </details>
          );
        })}
      </div>
      <Link href="/request-quote" className="mt-4 inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400">
        Discuss your workflow
      </Link>
    </section>
  );
}
