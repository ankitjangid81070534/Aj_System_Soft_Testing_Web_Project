/**
 * Site-wide motion policy.
 *
 * Motion used to follow the OS `prefers-reduced-motion` flag. Windows reports
 * that flag whenever "Animation effects" is switched off (the default on many
 * office PCs and on "best performance" power plans), which silently turned the
 * whole site static — no smooth scroll, scroll scenes, tilt, reveals or CSS
 * animation — on machines where reference sites like juspay.io still animate.
 *
 * Motion is therefore on by default. Reduced motion is an explicit, in-site
 * choice: `localStorage["ajs-motion"] = "reduce"` sets `data-motion="reduce"`
 * on <html> before first paint (see the boot script in `app/layout.tsx`), and
 * CSS/JS read that attribute instead of the OS media query.
 */
import { useSyncExternalStore } from "react";

export const MOTION_STORAGE_KEY = "ajs-motion";
export const REDUCED_MOTION_ATTRIBUTE = "data-motion";

export function prefersReducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(REDUCED_MOTION_ATTRIBUTE) === "reduce";
}

function subscribeToPreference(onChange: () => void) {
  if (typeof MutationObserver === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [REDUCED_MOTION_ATTRIBUTE] });
  return () => observer.disconnect();
}
const serverSnapshot = () => false;

/**
 * React hook mirror of `prefersReducedMotion()`. Replaces framer-motion's
 * `useReducedMotion()`, which reads the OS flag and left the hero core, planet
 * and process scenes static on Windows PCs with "Animation effects" off.
 */
export function useSiteReducedMotion(): boolean {
  return useSyncExternalStore(subscribeToPreference, prefersReducedMotion, serverSnapshot);
}

type Listener = () => void;

/**
 * Drop-in replacement for `matchMedia("(prefers-reduced-motion: reduce)")`:
 * `matches` reflects the site preference and `change` fires only when the
 * <html> attribute itself is toggled (never from the OS setting).
 */
export function reducedMotionMedia() {
  const listeners = new Map<Listener, Listener>();
  let observer: MutationObserver | undefined;

  const start = () => {
    if (observer || typeof MutationObserver === "undefined") return;
    observer = new MutationObserver(() => listeners.forEach((wrapped) => wrapped()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: [REDUCED_MOTION_ATTRIBUTE] });
  };
  const stop = () => {
    if (listeners.size) return;
    observer?.disconnect();
    observer = undefined;
  };

  return {
    get matches() {
      return prefersReducedMotion();
    },
    addEventListener(_type: "change", listener: Listener, options?: { once?: boolean }) {
      const wrapped: Listener = options?.once
        ? () => {
            listeners.delete(listener);
            stop();
            listener();
          }
        : listener;
      listeners.set(listener, wrapped);
      start();
    },
    removeEventListener(_type: "change", listener: Listener) {
      listeners.delete(listener);
      stop();
    },
  };
}
