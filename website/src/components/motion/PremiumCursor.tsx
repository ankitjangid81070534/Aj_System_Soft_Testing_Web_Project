"use client";

import { useEffect, useRef } from "react";
import styles from "./premium-cursor.module.css";
import { prefersReducedMotion } from "./motion-preference";

/* Anything the user can act on switches the arrow to a hand; text-entry fields
 * hand control back to the native I-beam so typing and selection stay precise. */
const INTERACTIVE = "a, button, summary, label, select, [role='button'], [role='tab'], [role='link'], [data-tilt], input[type='checkbox'], input[type='radio'], input[type='submit'], input[type='button']";
const TEXT_ENTRY = "input:not([type='checkbox'], [type='radio'], [type='submit'], [type='button'], [type='range'], [type='color'], [type='file']), textarea, [contenteditable='true'], iframe";

/**
 * Premium 3D arrow cursor: a blue→violet bevelled arrow (white rim, glossy
 * highlight, depth shadow) that tilts softly with horizontal speed, a blurred
 * glow aura that trails it, a hand over clickable elements and a ripple on
 * click. The arrow itself tracks 1:1 so aiming stays precise. The layer is a
 * manual popover, re-raised whenever a modal dialog opens, so it stays above
 * top-layer popups like the offer banner. Mouse/trackpad only; pointer-events
 * are off so it never blocks a click.
 */
export function PremiumCursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const layer = layerRef.current;
    const pointer = pointerRef.current;
    const aura = auraRef.current;
    if (!fine.matches || !layer || !pointer || !aura) return;

    const root = document.documentElement;
    const canPopover = typeof layer.showPopover === "function";
    const raise = () => {
      if (!canPopover || !layer.isConnected) return;
      try {
        if (layer.matches(":popover-open")) layer.hidePopover();
        layer.showPopover();
      } catch { /* layer falls back to its z-index */ }
    };
    raise();
    root.classList.add("has-premium-cursor");

    // A modal <dialog> enters the top layer above everything; re-raise after it.
    const observer = new MutationObserver((records) => {
      if (records.some((r) => r.target instanceof HTMLDialogElement && r.target.open)) raise();
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    let x = -100, y = -100, ax = -100, ay = -100, lastX = -100, tilt = 0, targetTilt = 0;
    let frame = 0;
    const render = () => {
      frame = 0;
      const snap = prefersReducedMotion();
      ax += (x - ax) * (snap ? 1 : 0.16);
      ay += (y - ay) * (snap ? 1 : 0.16);
      targetTilt *= 0.82;
      tilt += (targetTilt - tilt) * (snap ? 1 : 0.2);
      pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      pointer.style.setProperty("--tilt", `${snap ? 0 : tilt.toFixed(2)}deg`);
      aura.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      if (Math.abs(x - ax) > 0.2 || Math.abs(y - ay) > 0.2 || Math.abs(tilt) > 0.05) frame = requestAnimationFrame(render);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      x = event.clientX;
      y = event.clientY;
      if (root.dataset.cursor !== "on") {
        root.dataset.cursor = "on";
        ax = x; ay = y; lastX = x;
      }
      targetTilt = Math.max(-10, Math.min(10, targetTilt + (x - lastX) * 0.35));
      lastX = x;
      const target = event.target instanceof Element ? event.target : null;
      const state = !target ? "" : target.closest(TEXT_ENTRY) ? "text" : target.closest(INTERACTIVE) ? "hover" : "";
      if (root.dataset.cursorState !== state) root.dataset.cursorState = state;
      schedule();
    };
    const onDown = (event: PointerEvent) => {
      root.dataset.cursorPress = "1";
      if (prefersReducedMotion() || root.dataset.cursorState === "text") return;
      const ripple = document.createElement("span");
      ripple.className = styles.ripple;
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
      layer.appendChild(ripple);
    };
    const onUp = () => { delete root.dataset.cursorPress; };
    const onLeave = () => { root.dataset.cursor = "off"; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
      try { if (canPopover && layer.matches(":popover-open")) layer.hidePopover(); } catch { /* noop */ }
      root.classList.remove("has-premium-cursor");
      delete root.dataset.cursor;
      delete root.dataset.cursorState;
      delete root.dataset.cursorPress;
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden popover="manual" className={styles.layer}>
      <svg width="0" height="0" className={styles.defs}>
        <defs>
          <linearGradient id="pc-fill" x1="0.1" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#8fc2ff" />
            <stop offset="0.45" stopColor="#3079ea" />
            <stop offset="1" stopColor="#7c4dff" />
          </linearGradient>
          <linearGradient id="pc-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div ref={auraRef} className={styles.aura}><span /></div>
      <div ref={pointerRef} className={styles.pointer}>
        <div className={styles.tilt}>
          <svg className={styles.arrow} viewBox="0 0 24 24" width="26" height="26">
            <path d="M4.5 2.5v17.2l4.6-4.3 2.9 6.6 3.2-1.4-2.9-6.5h6.3z" fill="url(#pc-fill)" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M6 5.6v9.6l2.4-2.2L12.8 13z" fill="url(#pc-shine)" opacity="0.7" />
          </svg>
          <svg className={styles.hand} viewBox="0 0 24 24" width="28" height="28">
            <path
              d="M9 2.5c-1 0-1.8.8-1.8 1.8v8.6l-1.3-1.3c-.7-.7-1.9-.7-2.6 0-.7.7-.7 1.8-.1 2.5l4.4 5.3c1.1 1.4 2.8 2.1 4.6 2.1h2.3c3 0 5.4-2.4 5.4-5.4v-4.4c0-1-.8-1.8-1.8-1.8-.4 0-.7.1-1 .3-.2-.8-1-1.4-1.8-1.4-.5 0-.9.2-1.2.4-.3-.7-1-1.2-1.7-1.2-.3 0-.6.1-.9.2V4.3c0-1-.8-1.8-1.8-1.8z"
              fill="url(#pc-fill)"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M8.2 4.4v6.2" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M10.8 9.8v3.6M13.7 10.6v2.8M16.6 11.6v1.9" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
