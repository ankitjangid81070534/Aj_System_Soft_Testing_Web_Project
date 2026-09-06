"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Accessible tabs with a soft sliding indicator: the highlight pill
 * translates between buttons instead of re-mounting per tab.
 * Roving tabindex, Arrow/Home/End keys, aria wiring.
 */
export function Tabs({
  items,
  className,
  label,
}: {
  items: TabItem[];
  label: string;
  className?: string;
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(items[0]?.id);
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const moveIndicator = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLButtonElement>(`[data-tab-id="${activeId}"]`);
    if (!active) return;
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth, ready: true });
  }, [activeId]);

  useLayoutEffect(() => {
    moveIndicator();
  }, [moveIndicator]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => moveIndicator());
    observer.observe(list);
    return () => observer.disconnect();
  }, [moveIndicator]);

  function onKeyDown(event: React.KeyboardEvent) {
    const index = items.findIndex((item) => item.id === activeId);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    setActiveId(items[next].id);
    listRef.current?.querySelector<HTMLButtonElement>(`#${baseId}-tab-${items[next].id}`)?.focus();
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="relative inline-flex max-w-full flex-wrap gap-1 rounded-full border border-line bg-surface p-1 shadow-e1"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-1 top-1 rounded-full bg-brand-600 shadow-e2 transition-all duration-250 ease-soft",
            indicator.ready ? "opacity-100" : "opacity-0",
          )}
          style={{ left: indicator.left, width: indicator.width }}
        />
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              data-tab-id={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ease-soft focus-ring",
                selected ? "text-on-brand" : "text-ink-muted hover:bg-canvas-raised hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <div
            key={item.id}
            id={`${baseId}-panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${item.id}`}
            hidden={!selected}
            tabIndex={0}
            className="mt-6 rounded-2xl focus-ring"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}
