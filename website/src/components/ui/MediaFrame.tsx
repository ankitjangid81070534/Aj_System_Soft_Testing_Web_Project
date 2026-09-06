import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Aspect = "16/9" | "16/10" | "4/3" | "1/1";

const aspectClass: Record<Aspect, string> = {
  "16/9": "aspect-video",
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

/**
 * Soft-3D application window frame for screenshots and product previews:
 * browser-chrome top bar, rounded body, layered shadow. CSS-only depth.
 */
export function MediaFrame({
  src,
  alt,
  label,
  aspect = "16/10",
  className,
  children,
  priority = false,
}: {
  src?: string;
  alt: string;
  /** Small caption rendered in the window chrome. */
  label?: string;
  aspect?: Aspect;
  className?: string;
  /** Custom body content (used instead of the image). */
  children?: ReactNode;
  priority?: boolean;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-canvas-raised shadow-3d",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-success/70" />
        {label ? (
          <figcaption className="ml-2 truncate text-xs font-medium text-ink-muted">
            {label}
          </figcaption>
        ) : null}
      </div>
      <div className={cn("relative overflow-hidden bg-canvas", aspectClass[aspect])}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 60vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          children
        )}
      </div>
    </figure>
  );
}
