"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { Field, Input } from "@/components/ui/Input";

export type LocationOption = { code: string; name: string };

const MAX_VISIBLE = 80;

/**
 * Searchable dropdown that also accepts a custom value. The input itself carries
 * `name`, so whatever the user picks or types is what the form submits.
 */
export function LocationCombobox({
  id,
  name,
  label,
  value,
  options,
  loading,
  disabled,
  placeholder,
  autoComplete,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: LocationOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string, option?: LocationOption) => void;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const query = value.trim().toLowerCase();
  const matches = useMemo(() => {
    const list = query
      ? options.filter((o) => o.name.toLowerCase().includes(query))
      : options;
    return list.slice(0, MAX_VISIBLE);
  }, [options, query]);
  const exact = options.some((o) => o.name.toLowerCase() === query);
  const showCustom = query.length > 0 && !exact;
  const total = matches.length + (showCustom ? 1 : 0);

  function pick(index: number) {
    if (index < matches.length) onChange(matches[index].name, matches[index]);
    else onChange(value.trim());
    setOpen(false);
  }

  function type(next: string) {
    const match = options.find((o) => o.name.toLowerCase() === next.trim().toLowerCase());
    onChange(next, match);
    setActive(0);
    setOpen(true);
  }

  return (
    <Field label={label} htmlFor={id} required>
      <div className="relative">
        <Input
          id={id}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete={autoComplete}
          required
          maxLength={80}
          disabled={disabled}
          placeholder={placeholder ?? "Search or type…"}
          value={value}
          onChange={(e) => type(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, total - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open && total > 0) {
              e.preventDefault();
              pick(active);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="pr-9"
        />
        <span className="pointer-events-none absolute right-3 top-3.5 text-ink-muted">
          {loading ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          )}
        </span>
        {open && !disabled && total > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-surface py-1 text-sm text-ink shadow-e2"
          >
            {matches.map((option, index) => (
              <li
                key={option.code}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(index);
                }}
                onMouseEnter={() => setActive(index)}
                className={`cursor-pointer px-3 py-2 ${index === active ? "bg-brand-600/15" : ""}`}
              >
                {option.name}
              </li>
            ))}
            {showCustom ? (
              <li
                role="option"
                aria-selected={active === matches.length}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(matches.length);
                }}
                onMouseEnter={() => setActive(matches.length)}
                className={`flex cursor-pointer items-center gap-2 border-t border-line px-3 py-2 font-medium text-brand-700 ${active === matches.length ? "bg-brand-600/15" : ""}`}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Use custom: “{value.trim()}”
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
