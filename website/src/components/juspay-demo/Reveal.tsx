import type { CSSProperties, ReactNode } from "react";

/**
 * Soft scroll reveal: content is visible by default (no-JS, reduced motion,
 * hidden tabs) and the site's shared RevealObserver runs a single fade-and-lift
 * entrance when the element scrolls into view.
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
  const style = { "--reveal-delay": `${Math.round(delay * 1000)}` } as CSSProperties;
  return (
    <div className={className} data-reveal style={style}>
      {children}
    </div>
  );
}
