"use client";

import { useEffect, useRef } from "react";
import styles from "./premium-cursor.module.css";
import { prefersReducedMotion } from "./motion-preference";

/* Anything the user can act on grows the ring; text-entry fields hand control
 * back to the native I-beam so typing and selection stay precise. */
const INTERACTIVE = "a, button, summary, label, select, [role='button'], [role='tab'], [data-tilt], input[type='checkbox'], input[type='radio'], input[type='submit'], input[type='button']";
const TEXT_ENTRY = "input:not([type='checkbox'], [type='radio'], [type='submit'], [type='button'], [type='range'], [type='color'], [type='file']), textarea, [contenteditable='true'], iframe";

/**
 * Premium two-part cursor: a glossy 3D sphere that tracks the pointer exactly
 * and a glass ring that trails it with soft damping. Mouse/trackpad only —
 * touch devices never mount it and keep native behaviour. Pure DOM + rAF, no
 * React re-renders; pointer-events are off so it can never block a click.
 */
export function PremiumCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!fine.matches || !dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-premium-cursor");
    let x = -100, y = -100, rx = -100, ry = -100;
    let frame = 0;
    let visible = false;

    const render = () => {
      frame = 0;
      const snap = prefersReducedMotion();
      rx += (x - rx) * (snap ? 1 : 0.2);
      ry += (y - ry) * (snap ? 1 : 0.2);
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) frame = requestAnimationFrame(render);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        visible = true;
        rx = x; ry = y;
        root.dataset.cursor = "on";
      }
      const target = event.target instanceof Element ? event.target : null;
      const state = !target ? "" : target.closest(TEXT_ENTRY) ? "text" : target.closest(INTERACTIVE) ? "hover" : "";
      if (root.dataset.cursorState !== state) root.dataset.cursorState = state;
      schedule();
    };
    const onDown = () => { root.dataset.cursorPress = "1"; };
    const onUp = () => { delete root.dataset.cursorPress; };
    const onLeave = () => { visible = false; root.dataset.cursor = "off"; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove("has-premium-cursor");
      delete root.dataset.cursor;
      delete root.dataset.cursorState;
      delete root.dataset.cursorPress;
    };
  }, []);

  return (
    <div aria-hidden className={styles.layer}>
      <div ref={ringRef} className={styles.ring}><span /></div>
      <div ref={dotRef} className={styles.dot}><span /></div>
    </div>
  );
}
