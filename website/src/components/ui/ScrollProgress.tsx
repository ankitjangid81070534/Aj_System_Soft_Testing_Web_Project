"use client";

import { useEffect, useRef } from "react";

/**
 * Thin brand-gradient reading-progress bar pinned to the top of the viewport.
 * Writes `transform: scaleX()` directly on the DOM node inside a rAF, so it
 * never triggers React re-renders and stays 60fps on low-end phones.
 * Purely decorative (aria-hidden) and invisible when the page cannot scroll.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      bar.style.opacity = ratio > 0.005 ? "1" : "0";
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-brand-gradient opacity-0 shadow-[0_0_12px_rgb(59_108_246/0.6)] transition-opacity duration-300 will-change-transform"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
