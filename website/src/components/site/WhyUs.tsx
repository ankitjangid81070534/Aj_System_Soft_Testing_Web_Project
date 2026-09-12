import { ListChecks, Rocket, ShieldCheck, Wrench } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";

const REASONS = [
  {
    Icon: ListChecks,
    title: "Requirements lead, code follows",
    description:
      "We invest in understanding your process before writing a line of code — the software fits the work, not the reverse.",
    tone: "from-brand-500 to-brand-700",
    glow: "rgba(37,87,232,0.5)",
  },
  {
    Icon: Rocket,
    title: "End-to-end delivery",
    description:
      "One team handles discovery, design, development, deployment and support — no handover gaps.",
    tone: "from-violet-500 to-violet-700",
    glow: "rgba(124,58,237,0.5)",
  },
  {
    Icon: Wrench,
    title: "Built to be maintained",
    description:
      "Clean architecture, typed models and documentation mean your software stays changeable for years.",
    tone: "from-cyan-500 to-cyan-700",
    glow: "rgba(6,182,212,0.5)",
  },
  {
    Icon: ShieldCheck,
    title: "Security & ownership",
    description:
      "Role-based access, protected data and a system you own outright — including the source code.",
    tone: "from-emerald-500 to-emerald-700",
    glow: "rgba(16,185,129,0.5)",
  },
] as const;

export function WhyUs() {
  return (
    <section data-home-section="principles" className="relative mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden="true"
        className="aurora aurora-b -left-40 bottom-0 -z-10 hidden h-96 w-96 lg:block"
      />
      <Reveal>
        <SectionHeader
          eyebrow="Why AJS Technology"
          title="Why teams choose AJ System Soft Technology"
          description="A focused development partner that treats your requirements as the specification."
        />
      </Reveal>
      <div data-section-grid className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ Icon, title, description, tone, glow }, index) => (
          <Reveal key={title} delay={index * 50} className="h-full">
            <article className="group card-3d flex h-full flex-col gap-4 rounded-[1.375rem] p-6">
              <span
                aria-hidden="true"
                className={`relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.15),0_10px_22px_-6px_var(--glow)] transition-transform duration-300 ease-spring group-hover:-translate-y-1 ${tone}`}
                style={{ "--glow": glow } as React.CSSProperties}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative z-10 text-[17px] font-semibold tracking-tight text-ink">
                {title}
              </h3>
              <p className="relative z-10 text-sm leading-relaxed text-ink-muted">{description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
