"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type AccordionItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

/**
 * Single-open accordion with CSS grid-rows height animation and full ARIA
 * wiring. Closed panels are inert so links inside them are unreachable.
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-surface shadow-e1 transition-colors duration-200",
              open ? "border-brand-200" : "border-line",
            )}
          >
            <h3>
              <button
                id={`${baseId}-button-${item.id}`}
                type="button"
                aria-expanded={open}
                aria-controls={`${baseId}-panel-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className={cn(
                  "action-control action-secondary disclosure-control flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-ink",
                  "transition-colors duration-150 hover:bg-canvas/60 focus-ring sm:text-base",
                )}
              >
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ease-soft",
                    open && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              id={`${baseId}-panel-${item.id}`}
              role="region"
              aria-labelledby={`${baseId}-button-${item.id}`}
              inert={!open}
              className={cn(
                "grid transition-all duration-300 ease-soft",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 text-sm text-ink-muted">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
