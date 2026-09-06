import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { serviceAccent } from "./service-accent";

export function ServiceCard({
  title,
  description,
  href,
  icon,
  meta,
  className,
}: {
  title: string;
  description?: string | null;
  href: string;
  /** Lucide icon node rendered in the soft brand tile. */
  icon?: ReactNode;
  /** Small meta line (e.g. category). */
  meta?: string | null;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group card-3d flex h-full flex-col gap-4 rounded-[1.375rem] p-5 focus-ring sm:p-6",
        `card-accent-${serviceAccent(href)}`,
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        {icon ? (
          <span aria-hidden="true" className="icon-tile h-12 w-12 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
        ) : (
          <span />
        )}
        <span
          aria-hidden="true"
          className="card-corner inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-e1 transition-[transform,color,background-color,border-color] duration-300 ease-spring group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="relative z-10 flex flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold tracking-tight text-ink transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">
          {title}
        </h3>
        {description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
      <div className="relative z-10 mt-auto flex items-center justify-between pt-2">
        {meta ? (
          <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
            {meta}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
          Learn more
          <span
            aria-hidden="true"
            className="block h-px w-0 bg-current transition-[width] duration-300 ease-soft group-hover:w-5"
          />
        </span>
      </div>
    </Link>
  );
}
