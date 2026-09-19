"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Next preserves history; an already-current fragment still needs a repeat scroll. */
export function SectionJumpLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (window.location.hash === `#${id}`) document.getElementById(id)?.scrollIntoView({ block: "start" });
      }}
    >
      {children}
    </Link>
  );
}
