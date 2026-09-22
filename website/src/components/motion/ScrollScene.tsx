"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./scroll-scene.module.css";
import { reducedMotionMedia } from "./motion-preference";

export type SceneVariant = "rise" | "zoom" | "swing" | "drift";

/* One shared scroll/resize subscription drives every mounted scene; each frame
 * measures the registered wrappers once and writes a 0→1 progress variable
 * that the CSS module turns into a perspective transform. */
const scenes = new Set<HTMLElement>();
let frame = 0;
let listening = false;

function measure() {
  frame = 0;
  const vh = window.innerHeight || 1;
  const travel = vh * 0.62;
  for (const element of scenes) {
    const top = element.getBoundingClientRect().top;
    const progress = Math.min(1, Math.max(0, (vh - top) / travel));
    element.style.setProperty("--sp", progress.toFixed(3));
  }
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(measure);
}
/* Synchronous measure for mount: the wrapper gets its true progress before the
 * first paint instead of waiting a frame (and hidden tabs throttle rAF). */
function measureNow() {
  if (frame) cancelAnimationFrame(frame);
  measure();
}
function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}
function unlisten() {
  if (!listening || scenes.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/**
 * Scroll-driven 3D entrance for a block of content. Content is fully settled
 * by default (server render, no JS, reduced motion); the transform only
 * engages once the scene is registered. Each section picks its own variant so
 * the page reads as a sequence of distinct moves rather than one repeated fade.
 */
export function ScrollScene({
  children,
  variant = "rise",
  className,
  style,
}: {
  children: ReactNode;
  variant?: SceneVariant;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = reducedMotionMedia();
    if (media.matches) return;
    element.dataset.sceneActive = "1";
    scenes.add(element);
    listen();
    measureNow();
    const disable = () => {
      scenes.delete(element);
      delete element.dataset.sceneActive;
      element.style.removeProperty("--sp");
      unlisten();
    };
    media.addEventListener("change", disable, { once: true });
    return () => {
      media.removeEventListener("change", disable);
      disable();
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.scene} ${styles[variant]} ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
