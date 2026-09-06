import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";
import { PLATFORM_ICONS } from "@/components/site/icons";

const PLATFORMS = [
  {
    Icon: PLATFORM_ICONS.Monitor,
    title: "Websites & Web Apps",
    description:
      "Company websites, customer portals and operational web applications built for speed and clarity.",
    tone: "from-brand-500 to-brand-700",
    accent: "blue",
    glow: "rgba(37,87,232,0.5)",
  },
  {
    Icon: PLATFORM_ICONS.Cloud,
    title: "SaaS Platforms",
    description:
      "Multi-tenant products with subscriptions, roles, dashboards and the APIs your customers need.",
    tone: "from-violet-500 to-violet-700",
    accent: "violet",
    glow: "rgba(124,58,237,0.5)",
  },
  {
    Icon: PLATFORM_ICONS.Smartphone,
    title: "Android & iOS Apps",
    description:
      "Native and cross-platform mobile apps, from customer-facing products to field-work tools.",
    tone: "from-emerald-500 to-emerald-700",
    accent: "emerald",
    glow: "rgba(16,185,129,0.5)",
  },
  {
    Icon: PLATFORM_ICONS.AppWindow,
    title: "Windows Desktop & EXE",
    description:
      "Desktop software for shops, offices and labs that needs to run reliably on local machines.",
    tone: "from-cyan-500 to-cyan-700",
    accent: "cyan",
    glow: "rgba(6,182,212,0.5)",
  },
  {
    Icon: PLATFORM_ICONS.LayoutDashboard,
    title: "ERP, CRM & Admin Panels",
    description:
      "Business systems that connect sales, stock, accounts and reporting in one manageable place.",
    tone: "from-orange-500 to-orange-700",
    accent: "amber",
    glow: "rgba(249,115,22,0.5)",
  },
  {
    Icon: PLATFORM_ICONS.Stethoscope,
    title: "Industry-Specific Software",
    description:
      "Hospital, clinic, pharmacy, retail POS, inventory and hotel software shaped by real workflows.",
    tone: "from-rose-500 to-rose-700",
    accent: "coral",
    glow: "rgba(244,63,94,0.5)",
  },
] as const;

export function PlatformsShowcase() {
  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-surface">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-80" />
      <div
        aria-hidden="true"
        className="aurora aurora-b -right-32 top-0 -z-10 hidden h-[420px] w-[420px] lg:block"
      />
      <div
        aria-hidden="true"
        className="aurora aurora-c -left-32 bottom-0 -z-10 hidden h-[380px] w-[380px] lg:block"
      />
      <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="What we build"
            title="One team, every platform"
            description="Tell us the problem — we propose the right platform and architecture for it, not the other way around."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map(({ Icon, title, description, tone, glow, accent }, index) => (
            <Reveal key={title} delay={index * 50} className="h-full">
              <article className={`group card-3d card-accent-${accent} flex h-full flex-col gap-4 rounded-[1.375rem] p-6`}>
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
      </div>
    </section>
  );
}
