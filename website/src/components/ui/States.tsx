import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-raised text-ink-muted"
        >
          {icon}
        </span>
      ) : null}
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-6 py-14 text-center",
        className,
      )}
    >
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
