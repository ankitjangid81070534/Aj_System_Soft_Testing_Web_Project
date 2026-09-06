import Image from "next/image";
import type { ReactNode } from "react";
import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type FrameVariant = "browser" | "desktop-app" | "mobile" | "laptop";

export type ProjectFrameProps = {
  variant?: FrameVariant;
  src?: string | null;
  alt: string;
  url?: string | null;
  title?: string | null;
  aspect?: "16/10" | "16/9" | "4/3" | "9/19" | "1/1";
  priority?: boolean;
  className?: string;
  children?: ReactNode;
};

const aspectClass = {
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "9/19": "aspect-[9/19]",
  "1/1": "aspect-square",
};

export function ProjectFrame({
  variant = "browser",
  src,
  alt,
  url,
  title,
  aspect = "16/10",
  priority = false,
  className,
  children,
}: ProjectFrameProps) {
  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "relative mx-auto w-full max-w-[280px] sm:max-w-[320px]",
          "rounded-[2.5rem] border-[6px] border-surface bg-surface p-2 shadow-3d",
          "outline outline-1 outline-line/60",
          className,
        )}
      >
        {/* Mobile top dynamic speaker / camera notch */}
        <div className="absolute left-1/2 top-3.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-ink/90 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-surface/20" />
        </div>

        {/* Screen body */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] bg-canvas",
            aspect === "9/19" ? "aspect-[9/19]" : "aspect-[9/18]",
          )}
        >
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes="(min-width: 640px) 320px, 280px"
              className="object-cover object-top"
            />
          ) : (
            children
          )}
        </div>
      </div>
    );
  }

  if (variant === "desktop-app") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-line bg-surface shadow-3d",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line bg-canvas-raised px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-danger/80" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-warning/80" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-success/80" />
          </div>
          {title ? (
            <span className="truncate text-xs font-medium text-ink-muted">{title}</span>
          ) : null}
          <div className="w-10" />
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
      </div>
    );
  }

  // Default: Browser Frame
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-3d",
        className,
      )}
    >
      {/* Browser Bar */}
      <div className="flex items-center gap-3 border-b border-line bg-canvas-raised px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-success/80" />
        </div>

        {/* Address Pill */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex max-w-sm items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] text-ink-muted shadow-inner">
            <Lock aria-hidden="true" className="h-3 w-3 text-success" />
            <span className="truncate">{url || "ajsystemsoft.in"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-ink-muted">
          <Globe aria-hidden="true" className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Screen / Content */}
      <div className={cn("relative overflow-hidden bg-canvas", aspectClass[aspect])}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 65vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
