import { Reveal } from "@/components/site/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { LaunchBenefit } from "@/lib/data/growth";
import { CheckCircle2 } from "lucide-react";

export function LaunchBenefits({ benefits }: { benefits: LaunchBenefit[] }) {
  if (benefits.length === 0) return null;

  return (
    <section aria-label="Launch benefits" className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Launch Benefits"
            title="What's included with every project"
            description="Our service goes beyond just writing code. Every custom software project includes these benefits by default."
            align="center"
          />
        </Reveal>
        
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.id} delay={index * 100}>
              <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-line bg-surface p-7 shadow-e1 transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-e2">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/40 dark:text-brand-400 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-ink">
                      {benefit.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
