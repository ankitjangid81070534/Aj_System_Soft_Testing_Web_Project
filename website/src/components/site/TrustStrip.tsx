import { LifeBuoy, ClipboardList, KeyRound, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const ITEMS = [
  {
    Icon: ClipboardList,
    title: "Requirements-first process",
    description: "We start from your workflows, not from a template.",
    tone: "from-brand-500 to-brand-700",
    glow: "rgba(37,87,232,0.45)",
  },
  {
    Icon: KeyRound,
    title: "You own your software",
    description: "Source code and documentation handed over with the build.",
    tone: "from-violet-500 to-violet-700",
    glow: "rgba(124,58,237,0.45)",
  },
  {
    Icon: LifeBuoy,
    title: "Maintenance & support",
    description: "Ongoing care after launch — updates, fixes and improvements.",
    tone: "from-emerald-500 to-emerald-700",
    glow: "rgba(16,185,129,0.45)",
  },
  {
    Icon: MessageSquare,
    title: "Clear communication",
    description: "Plain-language updates at every stage of the project.",
    tone: "from-cyan-500 to-cyan-700",
    glow: "rgba(6,182,212,0.45)",
  },
] as const;

export function TrustStrip() {
  return (
    <section aria-label="How we work" className="relative -mt-6 pb-4 sm:-mt-10">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <div className="glass-strong grid grid-cols-1 gap-x-6 gap-y-5 rounded-[1.75rem] px-5 py-6 shadow-float sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
          {ITEMS.map(({ Icon, title, description, tone, glow }, index) => (
            <Reveal key={title} delay={index * 60}>
              <div className="group flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-4px_var(--glow)] transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:-rotate-3 ${tone}`}
                  style={{ "--glow": glow } as React.CSSProperties}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
