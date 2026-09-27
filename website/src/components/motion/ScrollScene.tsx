"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./scroll-scene.module.css";
import { reducedMotionMedia } from "./motion-preference";

export type SceneVariant = "rise" | "zoom" | "swing" | "drift";

/* One shared scroll/resize subscription drives every mounted scene. Each frame
 * measures the registered wrappers once, eases the raw 0→1 position with a
 * soft ease-out curve, then glides the written `--sp` toward it with
 * frame-rate independent damping. The loop runs only while a scene is still
 * settling, so wheel steps and fast flicks become one weighted, soft motion. */
const scenes = new Set<HTMLElement>();
const current = new WeakMap<HTMLElement, number>();
let frame = 0;
let last = 0;
let listening = false;
/* Fraction of the remaining distance covered per 60fps frame. Lower = softer. */
const DAMPING = 0.11;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function targetProgress(element: HTMLElement, vh: number) {
  const top = element.getBoundingClientRect().top;
  const raw = Math.min(1, Math.max(0, (vh - top) / (vh * 0.7)));
  return easeOutCubic(raw);
}
function write(element: HTMLElement, value: number) {
  current.set(element, value);
  element.style.setProperty("--sp", value.toFixed(4));
}
function tick(now: number) {
  frame = 0;
  const dt = last ? Math.min(64, now - last) : 16.67;
  last = now;
  const k = 1 - Math.pow(1 - DAMPING, dt / 16.67);
  const vh = window.innerHeight || 1;
  let moving = false;
  for (const element of scenes) {
    const target = targetProgress(element, vh);
    const from = current.get(element) ?? target;
    let next = from + (target - from) * k;
    if (Math.abs(target - next) < 0.0008) next = target;
    else moving = true;
    if (next !== from) write(element, next);
  }
  if (moving) frame = requestAnimationFrame(tick);
  else last = 0;
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}
/* Synchronous placement on mount: the wrapper starts at its true progress
 * before the first paint instead of animating in from 0 (and hidden tabs
 * throttle rAF). */
function measureNow(element: HTMLElement) {
  write(element, targetProgress(element, window.innerHeight || 1));
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
  last = 0;
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
    measureNow(element);
    const disable = () => {
      scenes.delete(element);
      current.delete(element);
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
