import type { ReactNode } from "react";

/** A named keyboard scroll target without altering table content or columns. */
export function AdminTableRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="min-w-0 overflow-x-auto rounded-xl focus-ring"
    >
      {children}
    </div>
  );
}
