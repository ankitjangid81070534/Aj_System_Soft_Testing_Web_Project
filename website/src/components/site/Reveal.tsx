import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Scroll-reveal wrapper with zero hydration cost. The shared observer adds
 * `reveal-in` once and then unobserves the element.
 *
 * Content is visible by default: without JavaScript, before hydration, for
 * crawlers, for reduced-motion users and in print nothing is ever hidden.
 * `delay` is capped so large grids never wait long enough to look broken.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("reveal", className)}
      style={
        delay
          ? ({ "--reveal-delay": `${Math.min(Math.max(delay, 0), 160)}ms` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
