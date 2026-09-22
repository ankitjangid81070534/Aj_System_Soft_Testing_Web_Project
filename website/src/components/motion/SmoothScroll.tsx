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
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduce.matches || coarse.matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
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
