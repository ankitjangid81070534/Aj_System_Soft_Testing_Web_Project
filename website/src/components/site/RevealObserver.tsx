"use client";

import { useEffect } from "react";

/**
 * One observer for every reveal wrapper. It starts only after hydration, so
 * React's server markup is never mutated before it is claimed. Elements are
 * visible by default and permanently unobserved after their first reveal.
 */
export function RevealObserver() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Mobile viewports are short: trigger the reveal only once the element has
    // actually entered the viewport, otherwise the animation completes while
    // the card is still below the fold and the visitor never sees it.
    const isCompact = window.matchMedia("(max-width: 767px)").matches;
    const observerRootMargin = isCompact ? "0px 0px -6% 0px" : "0px 0px 8% 0px";
    // Fraction of the viewport height an element's top must cross before the
    // scroll fallback reveals it (1.0 = exactly the bottom edge).
    const scrollTriggerRatio = isCompact ? 0.94 : 1.02;

    const pending = new Set<HTMLElement>();
    const reveal = (element: HTMLElement) => {
      element.classList.remove("reveal-pending");
      element.classList.add("reveal-in");
      pending.delete(element);
      observer.unobserve(element);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
        }
      },
      { threshold: 0.04, rootMargin: observerRootMargin },
    );

    const register = () => {
      // Anything already on (or just under) the first screen is shown at once
      // so the visible page never animates in after load.
      const line = window.innerHeight * (isCompact ? 1.0 : 1.15);
      const nodes = document.querySelectorAll<HTMLElement>(".reveal:not([data-reveal-bound])");
      for (const element of nodes) {
        element.dataset.revealBound = "true";
        if (element.getBoundingClientRect().top <= line) {
          element.classList.add("reveal-in");
        } else {
          element.classList.add("reveal-pending");
          pending.add(element);
          observer.observe(element);
        }
      }
    };

    let frame = 0;
    const schedule = (callback: () => void) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(callback);
    };
    const checkVisible = () => {
      const lowerEdge = window.innerHeight * scrollTriggerRatio;
      // At the end of the document nothing can scroll further into view, so
      // any element still inside the viewport must be revealed now.
      const atPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      for (const element of pending) {
        const rect = element.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom >= -20;
        if ((rect.top <= lowerEdge && rect.bottom >= -20) || (atPageEnd && inViewport)) {
          reveal(element);
        }
      }
    };
    const onViewportChange = () => schedule(checkVisible);
    const mutations = new MutationObserver(() => {
      schedule(() => {
        register();
        checkVisible();
      });
    });
    register();
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
  }, []);

  return null;
}
