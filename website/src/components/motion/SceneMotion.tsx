"use client";

import { useEffect } from "react";
import { clamp } from "./motion-utils";
import { createFrameScheduler } from "./frame-scheduler";

/** Visible decorative scenes only. Batched layout reads precede style writes;
 * native scrolling and navbar geometry remain untouched. Idle when settled. */
export function SceneMotion() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const scenes = new Map<HTMLElement, { visible: boolean; current: number; target: number }>();
    let header: HTMLElement | null = null;
    let darkSections: HTMLElement[] = [];
    let frame = 0;
    let previous = 0;
    let dirty = true;
    const tick = (time: number) => {
      frame = 0;
      if (document.hidden) return;
      let tone: string | undefined;
      if (dirty) {
        dirty = false;
        if (header) {
          const edge = header.getBoundingClientRect().bottom;
          tone = darkSections.some(element => {
            const rect = element.getBoundingClientRect();
            return rect.top <= edge && rect.bottom > edge;
          }) ? "dark" : "light";
        }
        if (!media.matches) scenes.forEach((state, element) => {
          if (!state.visible) return;
          const rect = element.getBoundingClientRect();
          state.target = clamp((innerHeight - rect.top) / Math.max(1, innerHeight + rect.height));
        });
      }
      // All geometry has been read; avoid alternating reads/writes per scene.
      if (header && tone && header.dataset.sceneTone !== tone) header.dataset.sceneTone = tone;
      const blend = 1 - Math.exp(-Math.min(time - (previous || time - 16), 50) / 125);
      previous = time;
      let moving = false;
      if (!media.matches) scenes.forEach((state, element) => {
        if (!state.visible || state.current === state.target) return;
        state.current += (state.target - state.current) * blend;
        if (Math.abs(state.target - state.current) < .0005) state.current = state.target;
        else moving = true;
        element.style.setProperty("--scene-progress", state.current.toFixed(4));
      });
      if (moving) frame = requestAnimationFrame(tick);
      else previous = 0;
    };
    const update = () => {
      dirty = true;
      if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = scenes.get(entry.target as HTMLElement);
        if (state) state.visible = entry.isIntersecting;
      }
      update();
    }, { rootMargin: "80px 0px" });
    const register = () => {
      scenes.forEach((_, element) => { if (!element.isConnected) { observer.unobserve(element); scenes.delete(element); } });
      document.querySelectorAll<HTMLElement>("[data-scroll-scene]").forEach(element => {
        if (scenes.has(element)) return;
        scenes.set(element, { visible: false, current: .5, target: .5 });
        observer.observe(element);
      });
      header = document.querySelector<HTMLElement>("[data-site-header]");
      darkSections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]'));
      update();
    };
    const registration = createFrameScheduler(register);
    const preference = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (media.matches) scenes.forEach((state, element) => {
        state.current = state.target = .5;
        element.style.setProperty("--scene-progress", ".5");
      });
      update();
    };
    const visibility = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (!document.hidden) update();
    };
    register();
    const mutations = new MutationObserver(registration.schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    addEventListener("scroll", update, { passive: true }); addEventListener("resize", update);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame); registration.cancel(); observer.disconnect(); mutations.disconnect();
      scenes.forEach((_, element) => element.style.removeProperty("--scene-progress"));
      if (header) delete header.dataset.sceneTone;
      removeEventListener("scroll", update); removeEventListener("resize", update);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", preference);
    };
  }, []);
  return null;
}
