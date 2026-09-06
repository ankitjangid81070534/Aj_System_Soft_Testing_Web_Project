import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold select-none " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-soft focus-ring " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "shine bg-brand-gradient text-on-brand shadow-[var(--shadow-btn)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] active:translate-y-px",
  secondary:
    "border border-line bg-surface text-ink shadow-e1 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-e3 active:translate-y-px",
  outline:
    "border border-brand-600/40 text-brand-700 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-50 hover:shadow-[var(--shadow-glow)] active:translate-y-px dark:text-brand-400",
  ghost: "text-ink-muted hover:bg-canvas-raised hover:text-ink",
  danger:
    "bg-danger text-on-danger shadow-e2 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-e3 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  xs: "h-8 px-3.5 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  loading?: boolean;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children" | "ref"> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href" | "ref"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

/**
 * Renders a <Link> when `href` is a string (external URLs open in a new tab),
 * otherwise a native <button>. UI-only props (variant/size/className) are
 * stripped before spreading the remainder onto the DOM element.
 */
export function Button(props: ButtonProps) {
  if ("href" in props && typeof props.href === "string") {
    const { href, variant, size, className, loading, children, ...rest } = props;
    if (/^https?:\/\//i.test(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes(variant, size, className)}
          {...rest}
        >
          {loading ? (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-current">
              <Spinner className="w-5 h-5" />
            </span>
          ) : null}
          <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>{children}</span>
        </a>
      );
    }
    // Same-origin new-tab links still get noopener for defence in depth.
    return (
      <Link
        href={href}
        className={classes(variant, size, className)}
        {...rest}
        {...(rest.target === "_blank" ? { rel: "noopener noreferrer" } : {})}
      >
        {loading ? (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-current">
            <Spinner className="w-5 h-5" />
          </span>
        ) : null}
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>{children}</span>
      </Link>
    );
  }
  const { variant, size, className, loading, children, disabled, ...rest } = props;
  return (
    <button className={classes(variant, size, className)} disabled={loading || disabled} {...rest}>
      {loading ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-current">
          <Spinner className="w-5 h-5" />
        </span>
      ) : null}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>{children}</span>
    </button>
  );
}
