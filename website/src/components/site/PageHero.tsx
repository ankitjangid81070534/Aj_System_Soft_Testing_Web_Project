import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";

/**
 * Premium page header for inner pages: engineering-grid + aurora backdrop,
 * breadcrumbs, eyebrow pill, display heading and optional right-side slot.
 * Pure CSS visuals — no JS, no layout shift, works without images.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  description,
  aside,
  className,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional content rendered to the right on large screens. */
  aside?: ReactNode;
  className?: string;
  /** Optional content rendered under the heading (e.g. filter chips). */
  children?: ReactNode;
}) {
  return (
    <header className={cn("relative isolate overflow-hidden border-b border-line bg-surface", className)}>
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-20" />
      <div
        aria-hidden="true"
        className="aurora aurora-a -top-40 left-[-6%] -z-10 h-[420px] w-[420px]"
      />
      <div
        aria-hidden="true"
        className="aurora aurora-b -top-24 right-[4%] -z-10 hidden h-[380px] w-[380px] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-canvas"
      />
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs items={crumbs} />
        <div
          className={cn(
            "mt-7 grid gap-8",
            aside ? "lg:grid-cols-[1.4fr_1fr] lg:items-end" : "max-w-3xl",
          )}
        >
          <SectionHeader as="h1" eyebrow={eyebrow} title={title} description={description}>
            {children}
          </SectionHeader>
          {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
        </div>
      </div>
    </header>
  );
}
