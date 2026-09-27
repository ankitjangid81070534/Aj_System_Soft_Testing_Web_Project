"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { reducedMotionMedia } from "./motion-preference";

/**
 * Juspay-style inertial scrolling (the reference site runs Lenis as well).
 *
 * Native scroll position stays the source of truth — only wheel input is
 * eased — so anchors, `scrollIntoView`, the smart header and the reveal
 * observer all keep working. Disabled for reduced motion and for touch-only
 * devices, where the OS scroll physics already feel right.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = reducedMotionMedia();
    // Only *touch-only* devices (phones/tablets) keep native scroll physics.
    // `(pointer: coarse)` alone is also reported by Windows touchscreen laptops,
    // all-in-one PCs and some pen/tablet drivers, which silently disabled smooth
    // scrolling on those desktops while a mouse was in use.
    const touchOnly = window.matchMedia("(hover: none) and (pointer: coarse)");
    if (reduce.matches || touchOnly.matches) return;

    const lenis = new Lenis({
      // Slightly heavier glide than before: softer deceleration, same speed.
      lerp: 0.075,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -96 },
      autoRaf: true,
    });
    document.documentElement.classList.add("has-smooth-scroll");

    const stop = () => {
      lenis.destroy();
      document.documentElement.classList.remove("has-smooth-scroll");
    };
    reduce.addEventListener("change", stop, { once: true });
    return () => {
      reduce.removeEventListener("change", stop);
      stop();
    };
  }, []);
  return null;
}
