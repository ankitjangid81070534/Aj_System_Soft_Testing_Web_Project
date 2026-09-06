"use client";

import { useEffect } from "react";
import { pointerTilt } from "./motion-utils";

/** Fine-pointer lighting/tilt only. Forms, tables, dialogs and touch devices
 * remain level; no pointer capture or changes to clicks, focus or navigation.
 */
export function SurfaceMotion() {
  useEffect(() => {
    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let card: HTMLElement | null = null;
    let frame = 0;
    let point = { x: 0, y: 0 };
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      if (card) for (const key of ["--tilt-x", "--tilt-y", "--mx", "--my"]) card.style.removeProperty(key);
      card = null;
    };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch" || !(event.target instanceof Element)) return;
      const next = event.target.closest<HTMLElement>(".card-3d, [data-tilt='on']");
      if (!next || next.dataset.tilt === "off" || next.closest("dialog, [data-admin-ui]") || next.querySelector("form, input, textarea, select, table")) { reset(); return; }
      if (next !== card) { reset(); card = next; }
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const tilt = pointerTilt(point.x - rect.left, point.y - rect.top, rect.width, rect.height);
        card.style.setProperty("--tilt-x", `${tilt.x.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tilt.y.toFixed(2)}deg`);
        card.style.setProperty("--mx", `${point.x - rect.left}px`);
        card.style.setProperty("--my", `${point.y - rect.top}px`);
      });
    };
    const leave = (event: PointerEvent) => {
      if (card && (!(event.relatedTarget instanceof Node) || !card.contains(event.relatedTarget))) reset();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    addEventListener("blur", reset); media.addEventListener("change", reset);
    return () => {
      reset(); document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", leave);
      removeEventListener("blur", reset); media.removeEventListener("change", reset);
    };
  }, []);
  return null;
}
