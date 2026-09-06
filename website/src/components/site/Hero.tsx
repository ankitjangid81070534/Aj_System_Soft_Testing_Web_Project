import Link from "next/link";
import { ArrowUpRight, Check, Layers, PenLine, Sparkles } from "lucide-react";
import { HeroVideo } from "@/components/site/HeroVideo";
import { BRAND } from "@/lib/seo/site";

/**
 * Floating liquid-glass badge. The outer wrapper owns the looping float
 * animation (CSS keyframes, staggered durations), the inner card owns the
 * hover scale/rotate — nesting avoids transform conflicts between the two.
 */
function FloatBadge({
  floatClass,
  delayClass,
  className,
  shadowColor,
  beadGradient,
  beadShadow,
  Icon,
  title,
  subtitle,
  rotate,
}: {
  floatClass: string;
  delayClass: string;
  className: string;
  shadowColor: string;
  beadGradient: string;
  beadShadow: string;
  Icon: typeof PenLine;
  title: string;
  subtitle: string;
  rotate: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute z-10 pointer-events-none select-none ${floatClass} ${delayClass} ${className}`}
    >
      <div
        className={`flex items-center gap-3 rounded-[20px] border border-white/80 bg-gradient-to-br from-white/85 to-white/55 px-5 py-3 ring-1 ring-black/5 backdrop-blur-[20px] transition-transform duration-300 ease-soft hover:rotate-[var(--hover-rotate)] hover:scale-[1.05] shadow-[inset_0_2.5px_4px_rgba(255,255,255,0.9),0_12px_32px_-4px_var(--badge-shadow)] dark:border-white/15 dark:from-white/10 dark:to-white/5 dark:ring-white/10 dark:shadow-[inset_0_2.5px_4px_rgba(255,255,255,0.12),0_12px_32px_-4px_var(--badge-shadow)] ${rotate}`}
        style={
          {
            "--badge-shadow": shadowColor,
          } as React.CSSProperties
        }
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${beadGradient}`}
          style={{ boxShadow: beadShadow }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex flex-col text-left leading-tight">
          <span className="text-[13px] font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold text-neutral-500 dark:text-ink-muted">
            {subtitle}
          </span>
        </span>
      </div>
    </div>
  );
}

const HERO_POINTS = [
  "Requirements-first delivery",
  "You own the source code",
  "Support after launch",
] as const;

/**
 * Hero — dual-column layout: copy + CTAs left, robot companion video inside a
 * soft-3D glass frame with floating badges right. Aurora + grid backdrop and
 * all motion are pure CSS (globals.css) so no extra JS ships for visuals.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-surface pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-28 lg:pt-14">
      {/* Engineering grid + aurora backdrop */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-20" />
      <div
        aria-hidden="true"
        className="aurora aurora-a -top-32 left-[4%] -z-10 h-[520px] w-[520px]"
      />
      <div
        aria-hidden="true"
        className="aurora aurora-b -top-10 right-[6%] -z-10 hidden h-[460px] w-[460px] lg:block"
      />
      <div
        aria-hidden="true"
        className="aurora aurora-c bottom-[-10%] left-[38%] -z-10 hidden h-[420px] w-[420px] lg:block"
      />
      {/* Soft fade into the page canvas below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-canvas"
      />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 px-6 sm:px-12 lg:grid-cols-12 lg:gap-10 lg:px-16">
        {/* Left column — copy, proof badge, CTAs */}
        <div className="flex max-w-[640px] flex-col items-start text-left lg:col-span-6 lg:pr-4">
          <div className="hero-rise glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5">
            <span className="relative inline-flex h-2 w-2 shrink-0 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-500 animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            <span className="text-[12.5px] text-ink-soft">
              {BRAND.primaryName} —{" "}
              <strong className="font-semibold text-ink">available for new projects</strong>
            </span>
          </div>

          <h1 className="hero-rise mt-7 select-none font-display text-[38px] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink [animation-delay:80ms] sm:text-[50px] lg:text-[64px]">
            Software built around{" "}
            <span className="text-gradient-animated">your requirements</span>.
          </h1>

          <p className="hero-rise mt-6 max-w-[520px] text-[17px] leading-relaxed text-ink-muted [animation-delay:160ms] sm:text-[18px]">
            Custom software, web platforms, SaaS, Android &amp; iOS apps and business automation
            systems — engineered around your workflows, from first mockup to launch.
          </p>

          <div className="hero-rise mt-9 flex flex-wrap items-center gap-5 [animation-delay:240ms]">
            <Link
              href="/request-quote"
              className="shine group inline-flex w-fit items-center gap-4 rounded-[18px] bg-brand-gradient py-2 pl-6 pr-2 text-sm font-bold text-white shadow-[var(--shadow-btn)] transition-[transform,box-shadow] duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] focus-ring"
            >
              Start Your Project
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-spring group-hover:-rotate-12 group-hover:scale-105">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/projects"
              className="group flex items-center gap-2.5 rounded-full focus-ring"
            >
              <span className="icon-tile h-10 w-10 !rounded-full">
                <Layers className="h-4 w-4" />
              </span>
              <span className="text-[14px] font-bold text-brand-600 transition-colors group-hover:text-brand-700 dark:text-brand-400">
                Explore Projects
              </span>
            </Link>
          </div>

          <ul className="hero-rise mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-soft [animation-delay:320ms]">
            {HERO_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — companion video in 3D frame + floating badges */}
        <div className="relative hidden w-full items-center justify-center pointer-events-none lg:col-span-6 lg:flex lg:justify-end">
          {/* Decorative orbit art */}
          <svg
            aria-hidden="true"
            viewBox="0 0 620 620"
            fill="none"
            className="absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-40 animate-spin-slow"
          >
            <defs>
              <linearGradient id="hero-orbit-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3b6cf6" />
                <stop offset="0.5" stopColor="#7c3aed" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="310" cy="310" r="300" stroke="url(#hero-orbit-a)" strokeDasharray="4 12" />
            <circle cx="310" cy="310" r="238" stroke="url(#hero-orbit-a)" strokeDasharray="2 9" />
            <circle cx="310" cy="310" r="178" stroke="url(#hero-orbit-a)" strokeDasharray="1 7" />
          </svg>

          <div className="hero-rise relative w-full max-w-[560px] [animation-delay:120ms]">
            {/* Glow behind the frame */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[40px] bg-brand-gradient opacity-25 blur-3xl"
            />
            {/* 3D glass frame */}
            <div className="glass relative overflow-hidden rounded-[28px] p-2 shadow-float tilt-3d">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              />
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-3 pb-2 pt-1">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                  <Sparkles className="h-3 w-3 text-brand-500" />
                  ajsystemsoft.in
                </span>
              </div>
              <div className="overflow-hidden rounded-[20px] ring-1 ring-black/5 dark:ring-white/10">
                <HeroVideo />
              </div>
            </div>
          </div>

          {/* Floating tasking badges (decorative) */}
          <FloatBadge
            floatClass="hero-float-a top-[14%] -right-2 sm:-right-8 md:-right-10"
            delayClass="[animation-delay:400ms]"
            className=""
            shadowColor="rgba(37,87,232,0.18)"
            beadGradient="from-[#3b6cf6] to-[#1d45cf]"
            beadShadow="0 4px 12px rgba(37,87,232,0.35)"
            Icon={PenLine}
            title="Custom software"
            subtitle="built to your spec"
            rotate="[--hover-rotate:1deg]"
          />
          <FloatBadge
            floatClass="hero-float-b top-[50%] -left-4 sm:-left-10 md:-left-14"
            delayClass="[animation-delay:600ms]"
            className="hidden sm:block"
            shadowColor="rgba(16,185,129,0.18)"
            beadGradient="from-[#10B981] to-[#059669]"
            beadShadow="0 4px 12px rgba(16,185,129,0.35)"
            Icon={Layers}
            title="Web · SaaS · Apps"
            subtitle="engineered end-to-end"
            rotate="[--hover-rotate:-1deg]"
          />
          <FloatBadge
            floatClass="hero-float-c bottom-[12%] -right-2 sm:-right-6 md:-right-8"
            delayClass="[animation-delay:800ms]"
            className="hidden sm:block"
            shadowColor="rgba(124,58,237,0.18)"
            beadGradient="from-[#8b5cf6] to-[#6d28d9]"
            beadShadow="0 4px 12px rgba(124,58,237,0.35)"
            Icon={Check}
            title="Requirements-first"
            subtitle="in every project"
            rotate="[--hover-rotate:1.5deg]"
          />
        </div>
      </div>
    </section>
  );
}
