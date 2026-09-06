import { Code2, Cloud, Database, Smartphone } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";

const GROUPS = [
  {
    Icon: Code2,
    title: "Web & frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST & GraphQL APIs"],
    tone: "from-brand-500 to-brand-700",
    glow: "rgba(37,87,232,0.5)",
  },
  {
    Icon: Smartphone,
    title: "Mobile",
    items: ["Android (Kotlin)", "iOS (Swift)", "React Native", "Flutter"],
    tone: "from-emerald-500 to-emerald-700",
    glow: "rgba(16,185,129,0.5)",
  },
  {
    Icon: Database,
    title: "Backend & data",
    items: ["Node.js", "PostgreSQL", "Supabase", "Authentication & RLS", "Background jobs"],
    tone: "from-violet-500 to-violet-700",
    glow: "rgba(124,58,237,0.5)",
  },
  {
    Icon: Cloud,
    title: "Desktop & cloud",
    items: [".NET / C#", "Electron", "Windows deployment", "Cloud hosting", "CI/CD"],
    tone: "from-cyan-500 to-cyan-700",
    glow: "rgba(6,182,212,0.5)",
  },
] as const;

const MARQUEE = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Kotlin",
  "Swift",
  "Flutter",
  ".NET",
  "Electron",
  "Tailwind CSS",
  "GraphQL",
  "CI/CD",
] as const;

export function TechCapabilities() {
  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-surface">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-80" />
      <div
        aria-hidden="true"
        className="aurora aurora-a left-1/2 top-1/2 -z-10 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 lg:block"
      />
      <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Technology"
            title="A modern, maintainable stack"
            description="We choose proven technology per project — here is what we commonly work with."
            align="center"
          />
        </Reveal>

        {/* Marquee ribbon (CSS-only, pauses on hover, static under reduced motion) */}
        <Reveal>
          <div
            aria-hidden="true"
            className="relative mt-10 overflow-hidden rounded-full border border-line bg-canvas/70 py-2.5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
          >
            <div className="marquee gap-3 px-3">
              {[...MARQUEE, ...MARQUEE].map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-semibold text-ink-soft shadow-e1"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map(({ Icon, title, items, tone, glow }, index) => (
            <Reveal key={title} delay={index * 50} className="h-full">
              <div className="group card-3d flex h-full flex-col gap-4 rounded-[1.375rem] p-5">
                <div className="relative z-10 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-4px_var(--glow)] transition-transform duration-300 ease-spring ${tone}`}
                    style={{ "--glow": glow } as React.CSSProperties}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-semibold tracking-tight text-ink">{title}</h3>
                </div>
                <ul className="relative z-10 flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors duration-200 group-hover:border-brand-100 group-hover:bg-brand-50/60"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
