import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/**
 * Reusable project-inquiry call-to-action band ("Start Your Project").
 * Premium 3D panel: deep navy → brand gradient, aurora glows, grid texture,
 * specular top edge. CSS-only, no runtime cost.
 */
export function CTA({
  eyebrow,
  title,
  description,
  primary = { label: "Start Your Project", href: "/request-quote" },
  secondary,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 px-6 py-14 text-center text-white sm:px-12 sm:py-20",
        "bg-[linear-gradient(168deg,#101318_0%,#0c0f14_100%)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_70px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      {/* Specular top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      {/* Fine grid texture + one restrained brand glow */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-25" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-56 w-[40rem] -translate-x-1/2 rounded-full bg-[#3079ea]/20 blur-[90px]"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
        {eyebrow ? (
          <p className="glass inline-flex items-center gap-2 rounded-full !border-white/25 !bg-white/10 px-3.5 py-1 text-eyebrow font-semibold uppercase tracking-[0.1em] text-white/90">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-display-md font-bold tracking-tight text-balance text-white">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Button
            href={primary.href}
            size="lg"
            className="!bg-white !bg-none !text-[#1d5bbf] !shadow-[0_10px_30px_-8px_rgba(255,255,255,0.45)] hover:!bg-brand-50"
          >
            {primary.label}
          </Button>
          {secondary ? (
            <Button
              href={secondary.href}
              variant="secondary"
              size="lg"
              className="!border-white/30 !bg-white/10 !bg-none !text-white backdrop-blur-md hover:!border-white/60 hover:!bg-white/15"
            >
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
