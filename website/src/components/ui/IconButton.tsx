import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md";

const sizes: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
};

export type IconButtonProps = Omit<ComponentProps<"button">, "className" | "children"> & {
  /** Accessible name is required — icon-only buttons have no visible text. */
  "aria-label": string;
  size?: Size;
  className?: string;
  children: ComponentProps<"button">["children"];
};

export function IconButton({ size = "md", className, type, ...props }: IconButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "icon-control inline-flex shrink-0 items-center justify-center rounded-full text-ink-muted",
        "transition-colors duration-200 ease-soft hover:bg-canvas-raised hover:text-ink focus-ring",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
