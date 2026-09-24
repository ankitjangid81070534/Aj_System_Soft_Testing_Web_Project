"use client";

import { useEffect, useRef } from "react";
import styles from "./premium-cursor.module.css";

/* Anything the user can act on switches the arrow to a hand; text-entry fields
 * hand control back to the native I-beam so typing and selection stay precise. */
const INTERACTIVE = "a, button, summary, label, select, [role='button'], [role='tab'], [role='link'], [data-tilt], input[type='checkbox'], input[type='radio'], input[type='submit'], input[type='button']";
const TEXT_ENTRY = "input:not([type='checkbox'], [type='radio'], [type='submit'], [type='button'], [type='range'], [type='color'], [type='file']), textarea, [contenteditable='true'], iframe";

/**
 * Premium arrow cursor (HeyGen-style): a crisp white arrow with a dark outline
 * and soft shadow that reads on dark and light surfaces, turning into a hand
 * over clickable elements. It tracks the pointer 1:1 (no lag) so aiming stays
 * precise. The layer is a manual popover, re-raised whenever a modal dialog
 * opens, so it stays above browser top-layer popups like the offer banner.
 * Mouse/trackpad only; pointer-events are off so it never blocks a click.
 */
export function PremiumCursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const layer = layerRef.current;
    const pointer = pointerRef.current;
    if (!fine.matches || !layer || !pointer) return;

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

    let x = -100, y = -100, frame = 0;
    const render = () => {
      frame = 0;
      pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      x = event.clientX;
      y = event.clientY;
      if (root.dataset.cursor !== "on") root.dataset.cursor = "on";
      const target = event.target instanceof Element ? event.target : null;
      const state = !target ? "" : target.closest(TEXT_ENTRY) ? "text" : target.closest(INTERACTIVE) ? "hover" : "";
      if (root.dataset.cursorState !== state) root.dataset.cursorState = state;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onDown = () => { root.dataset.cursorPress = "1"; };
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
      <div ref={pointerRef} className={styles.pointer}>
        <svg className={styles.arrow} viewBox="0 0 24 24" width="26" height="26">
          <defs>
            <linearGradient id="pc-arrow-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#e6eefc" />
            </linearGradient>
          </defs>
          <path
            d="M4.5 2.5v17.2l4.6-4.3 2.9 6.6 3.2-1.4-2.9-6.5h6.3z"
            fill="url(#pc-arrow-fill)"
            stroke="#0b1220"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <svg className={styles.hand} viewBox="0 0 24 24" width="28" height="28">
          <path
            d="M9 2.5c-1 0-1.8.8-1.8 1.8v8.6l-1.3-1.3c-.7-.7-1.9-.7-2.6 0-.7.7-.7 1.8-.1 2.5l4.4 5.3c1.1 1.4 2.8 2.1 4.6 2.1h2.3c3 0 5.4-2.4 5.4-5.4v-4.4c0-1-.8-1.8-1.8-1.8-.4 0-.7.1-1 .3-.2-.8-1-1.4-1.8-1.4-.5 0-.9.2-1.2.4-.3-.7-1-1.2-1.7-1.2-.3 0-.6.1-.9.2V4.3c0-1-.8-1.8-1.8-1.8z"
            fill="#ffffff"
            stroke="#0b1220"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M10.8 9.8v3.6M13.7 10.6v2.8M16.6 11.6v1.9" stroke="#0b1220" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}
