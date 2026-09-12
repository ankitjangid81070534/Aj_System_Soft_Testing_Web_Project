import type { ReactNode } from "react";
import { MotionWords } from "@/components/motion/MotionWords";
import { cn } from "@/lib/utils/cn";

type HeadingLevel = "h1" | "h2" | "h3";

export function SectionHeader({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  as?: HeadingLevel;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  const headingSize: Record<HeadingLevel, string> = {
    h1: "text-display-md font-medium",
    h2: "text-display-sm font-medium",
    h3: "text-xl font-semibold",
  };
  return (
    <div
      data-section-heading
      className={cn(
        "flex flex-col gap-3.5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-gradient-to-r from-brand-50 to-accent-50 px-3 py-1 text-eyebrow font-semibold uppercase tracking-[0.1em] text-brand-700 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] dark:border-brand-200 dark:from-brand-50 dark:to-accent-50 dark:text-brand-400">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-brand-gradient shadow-[0_0_0_3px_var(--color-brand-100)]"
          />
          {eyebrow}
        </p>
      ) : null}
      <Tag className={cn(headingSize[Tag], "tracking-[-0.02em] text-ink text-balance")}>
        {typeof title === "string" ? <MotionWords text={title} /> : title}
      </Tag>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-ink-muted sm:text-[17px]",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
