import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type SectionProps = ComponentProps<"section"> & {
  container?: "narrow" | "content" | "wide" | "full";
  children: ReactNode;
};

const containerClasses = {
  narrow: "max-w-narrow",
  content: "max-w-content",
  wide: "max-w-wide",
  full: "max-w-none",
};

export function Section({
  container = "content",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("relative overflow-hidden py-16 sm:py-20 lg:py-24", className)}
      {...props}
    >
      <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerClasses[container])}>
        {children}
      </div>
    </section>
  );
}
