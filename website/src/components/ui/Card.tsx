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
        "rounded-2xl border border-line bg-surface",
        flat ? "shadow-e1" : "card-3d shadow-e2",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-lg font-semibold tracking-tight text-ink", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("relative z-10 p-5 sm:p-6", className)} {...props} />;
}
