import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ReviewCardProps = {
  id?: string;
  authorName: string;
  authorRole?: string | null;
  authorCompany?: string | null;
  rating: number;
  reviewText: string;
  title?: string | null;
  projectName?: string | null;
  createdAt?: string | null;
  adminResponse?: string | null;
  isVerified?: boolean;
  className?: string;
};

export function ReviewCard({
  authorName,
  authorRole,
  authorCompany,
  rating,
  reviewText,
  title,
  projectName,
  createdAt,
  adminResponse,
  isVerified = true,
  className,
}: ReviewCardProps) {
  const stars = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <article
      className={cn(
        "card-3d flex h-full flex-col justify-between rounded-[1.375rem] p-5 sm:p-6",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-3 z-0 select-none font-serif text-[88px] font-bold leading-none text-brand-600/[0.07] dark:text-brand-400/10"
      >
        &rdquo;
      </span>
      <div className="relative z-10">
        {/* Rating and Verified Badge Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" aria-label={`Rating: ${stars} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                aria-hidden="true"
                className={cn(
                  "h-4 w-4",
                  i <= stars
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.45)]"
                    : "fill-canvas-raised text-line-strong",
                )}
              />
            ))}
          </div>

          {isVerified ? (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-soft px-2.5 py-0.5 text-[11px] font-medium text-success"
              title="Verified Client of AJ System Soft Technology"
            >
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              Verified Client
            </span>
          ) : null}
        </div>

        {/* Title if present */}
        {title ? (
          <h4 className="mt-3 text-base font-semibold tracking-tight text-ink">{title}</h4>
        ) : null}

        {/* Review Body */}
        <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">
          &ldquo;{reviewText}&rdquo;
        </blockquote>

        {/* Admin Response if available */}
        {adminResponse ? (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs dark:border-brand-900/60 dark:bg-brand-950/40">
            <p className="flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-400">
              <MessageSquare aria-hidden="true" className="h-3.5 w-3.5" />
              Response from AJ System Soft Technology:
            </p>
            <p className="mt-1 leading-normal text-ink-muted">{adminResponse}</p>
          </div>
        ) : null}
      </div>

      {/* Author & Project Footer */}
      <div className="relative z-10 mt-5 border-t border-line pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{authorName}</p>
            <p className="truncate text-xs text-ink-muted">
              {[authorRole, authorCompany].filter(Boolean).join(" · ") ||
                (projectName ? `Project: ${projectName}` : null)}
            </p>
          </div>
          {createdAt ? (
            <time className="shrink-0 text-xs text-ink-muted">
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </time>
          ) : null}
        </div>
      </div>
    </article>
  );
}
