"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { createFrameScheduler } from "@/components/motion/frame-scheduler";
import styles from "./reference.module.css";

/** Native scrolling, without wheel/touch interception. Short screens, phones,
 * reduced motion and no-JS use the same readable stacked content. */
export function ScrollJourney({ children, count }: { children: ReactNode; count: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const media = window.matchMedia("(min-width: 701px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)");
    const scenes = Array.from(track.children) as HTMLElement[];
    let frame = 0;
    let target = 0;
    let current = 0;
    let travel = 0;
    let lastTime = 0;
    let enabled = false;
    const paint = () => {
      track.style.transform = `translate3d(${current}px,0,0)`;
      const progress = -current / Math.max(1, travel);
      section.style.setProperty("--journey-progress", String(progress));
      scenes.forEach((scene, index) => {
        const phase = Math.max(-1, Math.min(1, index - progress * (count - 1)));
        scene.style.setProperty("--scene-phase", String(phase));
        scene.style.setProperty("--scene-distance", String(Math.abs(phase)));
      });
    };
    const tick = (time: number) => {
      frame = 0;
      if (document.hidden || !enabled) return;
      const dt = Math.min(time - (lastTime || time - 16), 50);
      lastTime = time;
      current += (target - current) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - current) < 0.1) current = target;
      paint();
      if (current !== target) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };
    const update = (snap = false) => {
      if (!enabled || document.hidden) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      travel = Math.max(0, track.scrollWidth - section.clientWidth);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      target = -progress * travel;
      if (snap) {
        cancelAnimationFrame(frame); frame = 0; lastTime = 0;
        current = target; paint();
      } else if (!frame && Math.abs(target - current) >= 0.1) {
        lastTime = 0; frame = requestAnimationFrame(tick);
      }
    };
    const scroll = createFrameScheduler(() => update());
    const resizeFrame = createFrameScheduler(() => update(true));
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; lastTime = 0;
      scroll.cancel(); resizeFrame.cancel();
      track.style.removeProperty("transform");
      section.style.removeProperty("--journey-progress");
      scenes.forEach(scene => {
        scene.style.removeProperty("--scene-phase");
        scene.style.removeProperty("--scene-distance");
      });
    };
    const configure = () => {
      reset();
      enabled = media.matches && count > 1;
      section.dataset.motion = enabled ? "horizontal" : "stacked";
      // Restoration/resize must not fly through earlier scenes from position 0.
      current = target = 0;
      update(true);
    };
    const onFocus = (event: FocusEvent) => {
      if (!enabled || !(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
      const scene = event.target.closest<HTMLElement>("[data-scene-index]");
      if (!scene) return;
      const index = Number(scene.dataset.sceneIndex);
      const start = section.getBoundingClientRect().top + window.scrollY;
      const distance = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: start + distance * index / Math.max(1, count - 1), behavior: "instant" });
      update(true);
    };
    const visibility = () => {
      cancelAnimationFrame(frame); frame = 0; lastTime = 0;
      scroll.cancel(); resizeFrame.cancel();
      if (!document.hidden) update(true);
    };
    configure();
    const resize = new ResizeObserver(resizeFrame.schedule);
    resize.observe(section);
    window.addEventListener("scroll", scroll.schedule, { passive: true });
    window.addEventListener("resize", resizeFrame.schedule);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", configure);
    section.addEventListener("focusin", onFocus);
    return () => {
      reset(); resize.disconnect();
      window.removeEventListener("scroll", scroll.schedule);
      window.removeEventListener("resize", resizeFrame.schedule);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", configure);
      section.removeEventListener("focusin", onFocus);
      delete section.dataset.motion;
    };
  }, [count]);
  return (
    <section ref={sectionRef} className={styles.journey} id="capabilities" aria-label="What we can build for you" data-scroll-scene data-nav-theme="dark" style={{ "--scene-count": count } as CSSProperties}>
      <div className={styles.journeyStage}>
        <div ref={trackRef} className={styles.journeyTrack} data-journey-track>{children}</div>
        <div className={styles.journeyProgress} aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
