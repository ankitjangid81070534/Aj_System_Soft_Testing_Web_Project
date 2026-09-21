"use client";

import { useEffect, useState } from "react";

const HIDE_AFTER = 96; // px scrolled before the header may hide
const DELTA = 6; // px of movement required to change direction

/**
 * "Ghost" navigation state (reference: juspay.io/in). The header hides while
 * the reader scrolls down and returns as soon as they scroll up or reach the
 * top. `scrolled` flips once the page has moved so the pill can pick up its
 * frosted background over content.
 */
export function useSmartHeader(locked: boolean) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y <= HIDE_AFTER) setHidden(false);
      else if (y > last + DELTA) setHidden(true);
      else if (y < last - DELTA) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { hidden: hidden && !locked, scrolled };
}
