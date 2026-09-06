import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

const baseField =
  "ui-field w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink " +
  "shadow-[inset_0_1px_2px_rgb(15_23_42/0.04)] " +
  "placeholder:text-ink-muted/70 transition-[border-color,box-shadow,background-color] duration-200 ease-soft " +
  "hover:border-line-strong " +
  "focus-visible:outline-none focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_4px_rgb(59_108_246/0.15),inset_0_1px_2px_rgb(15_23_42/0.04)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export type InputProps = ComponentProps<"input"> & { invalid?: boolean };

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        baseField,
        "h-11",
        invalid && "border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_4px_rgb(220_38_38/0.15)]",
        className,
      )}
      {...props}
    />
  );
}

export type TextareaProps = ComponentProps<"textarea"> & { invalid?: boolean };

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        baseField,
        "min-h-28 py-2.5",
        invalid && "border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_4px_rgb(220_38_38/0.15)]",
        className,
      )}
      {...props}
    />
  );
}

export type SelectProps = ComponentProps<"select"> & { invalid?: boolean };

export function Select({ invalid, className, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        baseField,
        "h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235b6478%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10",
        invalid && "border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_4px_rgb(220_38_38/0.15)]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Styled field wrapper: label + optional hint/error + control composition.
 * Keeps forms consistent and label/control association explicit via htmlFor.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-ink-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
