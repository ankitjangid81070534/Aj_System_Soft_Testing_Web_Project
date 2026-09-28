"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/components/admin/AdminNav";
import { cn } from "@/lib/utils/cn";

/**
 * Top-bar "jump to module" search: filters every admin option by name or
 * section; ↑/↓ to move, Enter to open, Esc to close, Ctrl/⌘+K to focus.
 */
export function AdminModuleSearch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ADMIN_NAV_ITEMS;
    return ADMIN_NAV_ITEMS.filter((item) =>
      `${item.label} ${item.group}`.toLowerCase().includes(needle),
    );
  }, [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        const input = inputRef.current;
        if (!input || input.offsetParent === null) return; // hidden copy (other breakpoint)
        event.preventDefault();
        input.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onNavigate?.();
    router.push(href);
  }

  const listId = `${id}-list`;
  const current = Math.min(active, Math.max(results.length - 1, 0));

  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Search admin options"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results.length > 0 ? `${id}-opt-${current}` : undefined}
        placeholder="Search admin options…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((current + 1) % Math.max(results.length, 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current - 1 + results.length) % Math.max(results.length, 1));
          } else if (event.key === "Enter" && results[current]) {
            event.preventDefault();
            go(results[current].href);
          } else if (event.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-14 text-sm text-ink shadow-e1 placeholder:text-ink-muted focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-ink-muted sm:block">
        Ctrl K
      </kbd>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Admin options"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-e3"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-muted">No admin option matches “{query}”.</li>
          ) : (
            results.map((item, index) => (
              <li
                key={item.href}
                id={`${id}-opt-${index}`}
                role="option"
                aria-selected={index === current}
                // mousedown keeps focus on the input so blur doesn't close first.
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(item.href);
                }}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm",
                  index === current ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400" : "text-ink-soft",
                )}
              >
                <item.Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate font-medium">{item.label}</span>
                <span className="text-[11px] text-ink-muted">{item.group}</span>
                {index === current ? <CornerDownLeft aria-hidden="true" className="h-3.5 w-3.5" /> : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
