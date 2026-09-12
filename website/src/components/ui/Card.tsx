import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Base surface card — soft-3D depth (gradient hairline, specular edge, hover
 * lift + brand glow via the `card-3d` utility). Pass `flat` to opt out of
 * hover motion for purely informational blocks.
 */
export function Card({
  className,
  flat = false,
  ...props
}: ComponentProps<"div"> & { flat?: boolean }) {
  return (
    <div
      className={cn(
        "card-surface rounded-card border border-line bg-surface",
        flat ? "shadow-e1" : "card-3d shadow-e2",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-card-title font-semibold tracking-tight text-ink", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("relative z-10 p-card sm:p-card-lg", className)} {...props} />;
}
