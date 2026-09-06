import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * GradientCard — premium 3D badge/title/CTA card with multi-color glowing
 * RGB aura, specular glass highlight, and smooth 3D hover elevation.
 */
const cardVariants = cva(
  "group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-line p-6 shadow-e1 transition-all duration-300 ease-soft card-3d sm:p-8 focus-within:shadow-e3",
  {
    variants: {
      gradient: {
        orange:
          "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent hover:border-amber-400/50 hover:shadow-[var(--shadow-3d-amber)] dark:from-amber-500/15 dark:via-orange-500/10 dark:to-transparent",
        gray:
          "bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent hover:border-indigo-400/50 hover:shadow-[var(--shadow-3d-indigo)] dark:from-indigo-500/15 dark:via-blue-500/10 dark:to-transparent",
        purple:
          "bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent hover:border-purple-400/50 hover:shadow-[var(--shadow-3d-purple)] dark:from-purple-500/15 dark:via-fuchsia-500/10 dark:to-transparent",
        green:
          "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent hover:border-emerald-400/50 hover:shadow-[var(--shadow-3d-emerald)] dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-transparent",
      },
    },
    defaultVariants: {
      gradient: "gray",
    },
  },
);

export interface GradientCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  badgeText: string;
  badgeColor: string; // hex/accent color for the badge dot, e.g. "#F59E0B"
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  /** Optional decorative image (Supabase/self-hosted only — CSP blocks other hosts). */
  imageUrl?: string;
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    { className, gradient, badgeText, badgeColor, title, description, ctaText, ctaHref, imageUrl, ...props },
    ref,
  ) => {
    const isExternal = /^https?:\/\//i.test(ctaHref);

    return (
      <div ref={ref} className={cn("h-full", className)}>
        <div className={cn(cardVariants({ gradient }), "h-full bg-surface")} {...props}>
          {/* Specular top glass edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          />

          {/* Decorative corner glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-3/4 w-3/4 rounded-full bg-white/40 blur-3xl transition-transform duration-500 ease-soft group-hover:scale-125 dark:bg-white/[0.06]"
          />

          {/* Optional decorative image */}
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- decorative background, not a content image
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute -bottom-1/4 -right-1/4 w-3/4 opacity-70 transition-transform duration-500 ease-soft group-hover:scale-110 group-hover:rotate-3 dark:opacity-25"
            />
          ) : null}

          <div className="z-10 flex h-full flex-col">
            {/* Badge */}
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold text-ink-muted shadow-xs backdrop-blur-md">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full ring-2 ring-white/50 dark:ring-black/20"
                style={{ backgroundColor: badgeColor }}
              />
              {badgeText}
            </div>

            {/* Title and description */}
            <div className="flex-grow">
              <h3 className="mb-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h3>
              <p className="max-w-xs text-sm text-ink-muted leading-relaxed">{description}</p>
            </div>

            {/* Call to action */}
            {isExternal ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="action-control action-primary group/cta mt-6 inline-flex w-fit items-center gap-2 rounded-full text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-ring dark:text-brand-400 dark:hover:text-brand-300"
              >
                {ctaText}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                />
              </a>
            ) : (
              <Link
                href={ctaHref}
                className="action-control action-primary group/cta mt-6 inline-flex w-fit items-center gap-2 rounded-full text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-ring dark:text-brand-400 dark:hover:text-brand-300"
              >
                {ctaText}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  },
);
GradientCard.displayName = "GradientCard";

export { GradientCard, cardVariants };
