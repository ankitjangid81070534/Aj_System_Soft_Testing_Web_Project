import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

/**
 * Hosts next/image may optimise. Keep in sync with `images.remotePatterns`
 * in next.config.ts — a URL outside this list makes next/image throw during
 * render, which would turn a whole page into a 500.
 */
const ALLOWED_HOSTS: ((host: string) => boolean)[] = [
  (host) => host.endsWith(".supabase.co"),
  (host) => host === "lh3.googleusercontent.com",
];

export function isSafeImageSrc(src: unknown): src is string {
  if (typeof src !== "string" || src.trim() === "") return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && ALLOWED_HOSTS.some((allowed) => allowed(url.hostname));
  } catch {
    return false;
  }
}

/** next/image that renders `fallback` instead of throwing on an unsupported URL. */
export function SafeImage({
  src,
  alt,
  fallback = null,
  ...props
}: Omit<ImageProps, "src"> & { src: string | null | undefined; fallback?: ReactNode }) {
  if (!isSafeImageSrc(src)) return <>{fallback}</>;
  return <Image src={src} alt={alt} {...props} />;
}
