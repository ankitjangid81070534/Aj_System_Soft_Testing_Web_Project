import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";

const STEPS = [
  {
    number: "01",
    title: "Discovery & requirements",
    description:
      "We sit with you (or your team) and map the exact workflows, rules and outcomes the software must support.",
  },
  {
    number: "02",
    title: "Proposal & planning",
    description:
      "You receive a clear scope, platform recommendation, timeline and transparent estimate — no surprises later.",
  },
  {
    number: "03",
    title: "Design & development",
    description:
      "We build in iterations you can see and click, refining screens and logic as the product takes shape.",
  },
  {
    number: "04",
    title: "Testing & deployment",
    description:
      "Real users test real scenarios before launch; we deploy, migrate data and verify everything in production.",
  },
  {
    number: "05",
    title: "Support & growth",
    description:
      "After launch we handle fixes, updates and new features as your business and software grow together.",
  },
] as const;

export function Process() {
  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-surface">
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="How we work"
            title="From your requirement to a working product"
            description="A straightforward five-step delivery process — you always know what is happening and what comes next."
          />
        </Reveal>
        <div className="relative mt-14">
          {/* Connecting gradient rail (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-[8%] right-[8%] top-7 hidden h-0.5 rounded-full bg-gradient-to-r from-brand-200 via-accent-300 to-cyan-300 opacity-70 lg:block"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {STEPS.map((step, index) => (
              <li key={step.number} className="relative">
                <Reveal delay={index * 70} className="h-full">
                  <div className="group flex h-full flex-col gap-4">
                    <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-6px_rgba(37,87,232,0.55)] transition-transform duration-300 ease-spring group-hover:-translate-y-1 group-hover:scale-105 group-hover:-rotate-3">
                      {step.number}
                      <span
                        aria-hidden="true"
                        className="absolute -inset-1 -z-10 rounded-[18px] bg-brand-gradient opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50"
                      />
                    </span>
                    <div className="card-3d flex flex-1 flex-col gap-2 rounded-[1.25rem] p-5">
                      <h3 className="relative z-10 font-semibold tracking-tight text-ink">
                        {step.title}
                      </h3>
                      <p className="relative z-10 text-sm leading-relaxed text-ink-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
