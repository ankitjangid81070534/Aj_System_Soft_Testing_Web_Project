"use client";

import { useEffect } from "react";

/** Animate only upon entry, never hide waiting content with a timer. */
export function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-experience]");
    if (!root || !("IntersectionObserver" in window)) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      if (media.matches) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer?.unobserve(element);
          if (element.getBoundingClientRect().bottom < 0) continue;
          const delay = Number.parseFloat(getComputedStyle(element).getPropertyValue("--reveal-delay")) || 0;
          const animation = element.animate([
            { opacity: 0, transform: "translate3d(0,38px,0) scale(.985)" },
            { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
          ], { duration: 1050, delay, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
      root.querySelectorAll<HTMLElement>(".reveal, [data-home-reveal]").forEach(element => observer?.observe(element));
    };
    setup();
    media.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      media.removeEventListener("change", setup);
    };
  }, []);
  return null;
}
