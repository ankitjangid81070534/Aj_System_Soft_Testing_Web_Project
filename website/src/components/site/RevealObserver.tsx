"use client";

import { useEffect } from "react";
import { revealFrames } from "@/components/motion/motion-utils";

/** One reversible lifecycle for the entire site. Nodes stay visible by default;
 * an entry animates once, a FULL viewport exit rearms it for the next visit.
 * Orbit entrances observe their stationary slot, never their animated bounds.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = new Map<HTMLElement, { element: HTMLElement; entered: boolean; animation?: Animation }>();
    let observer: IntersectionObserver | undefined;
    const register = () => {
      if (!observer) return;
      for (const [target, state] of nodes) {
        if (!state.element.isConnected) { state.animation?.cancel(); observer.unobserve(target); nodes.delete(target); }
      }
      document.querySelectorAll<HTMLElement>(".reveal, [data-home-reveal], [data-reveal]").forEach(element => {
        // An entrance translates far outside the viewport. Observing that moving
        // element makes its own animation cancel/rearm itself every few frames.
        const target = element.dataset.reveal === "orbit" ? element.parentElement ?? element : element;
        if (nodes.has(target)) return;
        nodes.set(target, { element, entered: false });
        observer!.observe(target);
      });
    };
    const setup = () => {
      observer?.disconnect();
      nodes.forEach(state => state.animation?.cancel());
      nodes.clear();
      observer = undefined;
      if (media.matches) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const state = nodes.get(entry.target as HTMLElement);
          if (!state) continue;
          const { element } = state;
          if (!entry.isIntersecting) {
            state.entered = false;
            state.animation?.cancel();
            state.animation = undefined;
            continue;
          }
          if (state.entered) continue;
          state.entered = true;
          // Do not move a form/card while someone is typing or using its controls.
          if (element.contains(document.activeElement)) continue;
          const variant = element.dataset.reveal;
          // The CSS entrance starts before hydration; later viewport visits replay it.
          if (variant === "orbit" && !element.dataset.revealCycle) { element.dataset.revealCycle = "1"; continue; }
          const delay = Math.min(variant === "orbit" ? 1100 : 240, Math.max(0, parseFloat(getComputedStyle(element).getPropertyValue(variant === "orbit" ? "--entry-delay" : "--reveal-delay")) || 0));
          state.animation = element.animate(revealFrames(variant, window.innerWidth < 701), {
            duration: variant === "orbit" ? 1700 : variant === "word" ? 850 : 1150, delay,
            easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards",
          });
          element.dataset.revealCycle = String(Number(element.dataset.revealCycle || 0) + 1);
          state.animation.onfinish = () => { state.animation = undefined; };
        }
      }, { threshold: 0 });
      register();
    };
    setup();
    const mutations = new MutationObserver(register);
    mutations.observe(document.body, { childList: true, subtree: true });
    media.addEventListener("change", setup);
    return () => {
      mutations.disconnect(); observer?.disconnect();
      nodes.forEach(state => state.animation?.cancel()); nodes.clear();
      media.removeEventListener("change", setup);
    };
  }, []);
  return null;
}
