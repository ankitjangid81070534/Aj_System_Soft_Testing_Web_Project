"use client";

import { useEffect } from "react";
import { revealFrames } from "@/components/motion/motion-utils";
import { createFrameScheduler } from "@/components/motion/frame-scheduler";

/** One entrance per mounted element. Content is visible by default and never
 * hidden/rearmed on viewport exit. Decorative orbit entrances remain CSS-owned. */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pending = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | undefined;
    const register = () => {
      for (const element of pending) {
        if (!element.isConnected) { observer?.unobserve(element); pending.delete(element); }
      }
      for (const [element, animation] of animations) {
        if (!element.isConnected) { animation.cancel(); animations.delete(element); }
      }
      document.querySelectorAll<HTMLElement>(".reveal, [data-home-reveal], [data-reveal]").forEach(element => {
        if (element.dataset.revealCycle || pending.has(element)) return;
        // On phones the containing block owns the entrance; avoid dozens of
        // simultaneous word animations inside the same fading heading.
        const compactWord = innerWidth < 701 && element.dataset.reveal === "word" && element.parentElement?.closest(".reveal, [data-home-reveal]");
        if (media.matches || element.dataset.reveal === "orbit" || compactWord) {
          element.dataset.revealCycle = "1";
          return;
        }
        pending.add(element);
        observer?.observe(element);
      });
    };
    const setup = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear(); pending.clear();
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (!entry.isIntersecting || element.dataset.revealCycle) continue;
          // Consume the entrance before animating: exit, mutations and Strict
          // Mode re-runs cannot restart an opacity animation on visible content.
          element.dataset.revealCycle = "1";
          observer?.unobserve(element); pending.delete(element);
          if (media.matches || element.contains(document.activeElement)) continue;
          const variant = element.dataset.reveal;
          const compact = window.innerWidth < 701;
          const delay = Math.min(compact ? 120 : 200, Math.max(0, parseFloat(getComputedStyle(element).getPropertyValue("--reveal-delay")) || 0));
          const nestedWord = variant === "word" && !!element.parentElement?.closest(".reveal, [data-home-reveal]");
          const animation = element.animate(revealFrames(variant, compact, nestedWord), {
            duration: compact ? 420 : 600, delay,
            easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards",
          });
          animations.set(element, animation);
          animation.onfinish = () => { animations.delete(element); };
        }
      }, { threshold: 0 });
      register();
    };
    setup();
    const registration = createFrameScheduler(register);
    const mutations = new MutationObserver(registration.schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      for (const [element, animation] of animations) {
        if (element.contains(event.target)) { animation.cancel(); animations.delete(element); }
      }
    };
    const visibility = () => {
      if (!document.hidden) return;
      animations.forEach(animation => animation.cancel()); animations.clear();
    };
    document.addEventListener("focusin", focus);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", setup);
    return () => {
      registration.cancel(); mutations.disconnect(); observer?.disconnect();
      document.removeEventListener("focusin", focus);
      document.removeEventListener("visibilitychange", visibility);
      animations.forEach(animation => animation.cancel()); animations.clear(); pending.clear();
      media.removeEventListener("change", setup);
    };
  }, []);
  return null;
}
