"use client";

import { useEffect } from "react";
import { clamp } from "./motion-utils";

/** A single, idle-when-settled loop for visible decorative scenes. Native scroll
 * position is never changed; reversing direction reverses their 3D movement.
 */
export function SceneMotion() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const scenes = new Map<HTMLElement, { visible: boolean; current: number; target: number }>();
    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      const blend = 1 - Math.exp(-Math.min(time - (previous || time - 16), 50) / 125);
      previous = time;
      let moving = false;
      scenes.forEach((state, element) => {
        if (!state.visible) return;
        state.current += (state.target - state.current) * blend;
        if (Math.abs(state.target - state.current) < .0005) state.current = state.target;
        else moving = true;
        element.style.setProperty("--scene-progress", state.current.toFixed(4));
      });
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const updateHeader = () => {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      if (!header) return;
      const edge = header.getBoundingClientRect().bottom;
      const dark = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]')).some(element => {
        const rect = element.getBoundingClientRect();
        return rect.top <= edge && rect.bottom > edge;
      });
      header.dataset.sceneTone = dark ? "dark" : "light";
    };
    const update = () => {
      updateHeader();
      if (media.matches) return;
      scenes.forEach((state, element) => {
        if (!state.visible) return;
        const rect = element.getBoundingClientRect();
        state.target = clamp((innerHeight - rect.top) / Math.max(1, innerHeight + rect.height));
      });
      if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
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
      updateHeader();
    };
    const preference = () => {
      cancelAnimationFrame(frame); frame = 0;
      if (media.matches) scenes.forEach((state, element) => { state.current = state.target = .5; element.style.setProperty("--scene-progress", ".5"); });
      else update();
    };
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(document.body, { childList: true, subtree: true });
    addEventListener("scroll", update, { passive: true }); addEventListener("resize", update);
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); mutations.disconnect();
      scenes.forEach((_, element) => element.style.removeProperty("--scene-progress"));
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      if (header) delete header.dataset.sceneTone;
      removeEventListener("scroll", update); removeEventListener("resize", update);
      media.removeEventListener("change", preference);
    };
  }, []);
  return null;
}
