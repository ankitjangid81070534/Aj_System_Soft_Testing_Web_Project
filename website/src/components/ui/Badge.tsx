import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-canvas text-ink-soft",
  brand: "border-brand-200 bg-brand-50 text-brand-700",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
  info: "border-info/20 bg-info-soft text-info",
};

export type BadgeProps = ComponentProps<"span"> & {
  tone?: Tone;
  children: ReactNode;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "warning" },
  published: { label: "Published", tone: "success" },
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
  public: { label: "Public", tone: "info" },
  private: { label: "Private", tone: "neutral" },
  new: { label: "New", tone: "brand" },
  contacted: { label: "Contacted", tone: "info" },
  qualified: { label: "Qualified", tone: "info" },
  proposal_sent: { label: "Proposal sent", tone: "info" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "danger" },
  spam: { label: "Spam", tone: "danger" },
};

/**
 * Content/record status indicator with a leading dot. Unknown values fall
 * back to a neutral pill showing the raw value.
 */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_MAP[status.toLowerCase()] ?? { label: status, tone: "neutral" as Tone };
  const dotColor: Record<Tone, string> = {
    neutral: "bg-ink-muted/60",
    brand: "bg-brand-500",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  };
  return (
    <Badge tone={meta.tone} className={className}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", dotColor[meta.tone])} />
      {meta.label}
    </Badge>
  );
}
