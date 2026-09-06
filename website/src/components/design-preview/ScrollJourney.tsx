"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./reference.module.css";

/** Native page scrolling drives a gently eased track; no wheel/touch interception.
 * Static stacked scenes are the default for mobile, reduced motion and no JS.
 */
export function ScrollJourney({ children, count }: { children: ReactNode; count: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const media = window.matchMedia("(min-width: 701px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let target = 0;
    let current = 0;
    let lastTime = 0;
    let enabled = false;
    const tick = (time: number) => {
      const dt = Math.min(time - (lastTime || time - 16), 50);
      lastTime = time;
      current += (target - current) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - current) < 0.1) current = target;
      track.style.transform = `translate3d(${current}px,0,0)`;
      const progress = -current / Math.max(1, track.scrollWidth - section.clientWidth);
      section.style.setProperty("--journey-progress", String(progress));
      Array.from(track.children).forEach((scene, index) => {
        const phase = Math.max(-1, Math.min(1, index - progress * (count - 1)));
        (scene as HTMLElement).style.setProperty("--scene-phase", String(phase));
        (scene as HTMLElement).style.setProperty("--scene-distance", String(Math.abs(phase)));
      });
      frame = current !== target ? requestAnimationFrame(tick) : 0;
    };
    const update = () => {
      if (!enabled) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      target = -progress * Math.max(0, track.scrollWidth - section.clientWidth);
      if (!frame && Math.abs(target - current) >= 0.1) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const configure = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      enabled = media.matches && count > 1;
      section.dataset.motion = enabled ? "horizontal" : "stacked";
      track.style.removeProperty("transform");
      current = target = 0;
      update();
    };
    const onFocus = (event: FocusEvent) => {
      if (!enabled || !(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
      const scene = event.target.closest<HTMLElement>("[data-scene-index]");
      if (!scene) return;
      const index = Number(scene.dataset.sceneIndex);
      const start = section.getBoundingClientRect().top + window.scrollY;
      const distance = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: start + distance * index / Math.max(1, count - 1), behavior: "smooth" });
    };
    configure();
    const resize = new ResizeObserver(update);
    resize.observe(section);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    media.addEventListener("change", configure);
    section.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener("change", configure);
      section.removeEventListener("focusin", onFocus);
      delete section.dataset.motion;
      section.style.removeProperty("--journey-progress");
      Array.from(track.children).forEach(scene => {
        (scene as HTMLElement).style.removeProperty("--scene-phase");
        (scene as HTMLElement).style.removeProperty("--scene-distance");
      });
      track.style.removeProperty("transform");
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
