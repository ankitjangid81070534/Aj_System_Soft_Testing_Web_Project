"use client";

import { useEffect } from "react";
import { reducedMotionMedia } from "./motion-preference";

const MAX_TILT = 7; // degrees

/**
 * Site-wide pointer-tracking 3D tilt for any `[data-tilt]` surface.
 * One delegated listener (no per-card React state) writes `--rx/--ry/--mx/--my`
 * on the hovered card; `juspay-site.css` turns them into a perspective
 * transform plus a soft light sheen. Off for touch and reduced motion.
 */
export function TiltEngine() {
  useEffect(() => {
    const reduce = reducedMotionMedia();
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduce.matches || coarse.matches) return;

    let active: HTMLElement | null = null;
    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    const reset = (element: HTMLElement) => {
      element.style.removeProperty("--rx");
      element.style.removeProperty("--ry");
      element.style.removeProperty("--mx");
      element.style.removeProperty("--my");
      delete element.dataset.tilting;
    };
    const paint = () => {
      frame = 0;
      if (!active) return;
      const rect = active.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = Math.min(1, Math.max(0, (lastX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (lastY - rect.top) / rect.height));
      active.style.setProperty("--rx", `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`);
      active.style.setProperty("--ry", `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`);
      active.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      active.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tilt]") : null;
      if (target !== active) {
        if (active) reset(active);
        active = target;
        if (active) active.dataset.tilting = "1";
      }
      if (!active) return;
      lastX = event.clientX;
      lastY = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
      if (active) reset(active);
    };
  }, []);
  return null;
}
