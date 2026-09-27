"use client";

import { useEffect } from "react";
import { reducedMotionMedia } from "@/components/motion/motion-preference";

/** Premium per-section scroll entrances layered on top of RevealObserver.
 * Uses only clip-path / translate / scale / filter (never `transform` or
 * `opacity`) so existing reveals, scroll scenes, tilt and hovers still compose.
 * Headings "type in" with a left→right wipe; card groups rise in one by one. */
function cardGroups(section: Element) {
  const groups: HTMLElement[][] = [];
  section.querySelectorAll<HTMLElement>("ul, ol, div").forEach(el => {
    const kids = Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
    if (kids.length < 3 || kids.length > 16) return;
    const display = getComputedStyle(el).display;
    if (!display.includes("grid") && !display.includes("flex")) return;
    if (el.closest("nav, header, footer, dialog, form")) return;
    if (kids.filter(k => k.offsetHeight > 90 && k.offsetWidth > 140).length >= 3) groups.push(kids);
  });
  // Keep innermost groups only, so a card is never animated twice.
  return groups.filter(g => !groups.some(o => o !== g && g.some(k => o.some(c => k !== c && k.contains(c)))));
}

/** Wipe a heading in line by line (line 1 fully, then line 2...), no blur. */
function typeLines(el: HTMLElement, compact: boolean) {
  const box = el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const rows: { top: number; bottom: number }[] = [];
  for (const r of Array.from(range.getClientRects())) {
    if (r.width < 1) continue;
    const row = rows.find(x => Math.abs(x.top - r.top) < r.height / 2);
    if (row) row.bottom = Math.max(row.bottom, r.bottom);
    else rows.push({ top: r.top, bottom: r.bottom });
  }
  rows.sort((a, b) => a.top - b.top);
  if (!rows.length) return;
  const pad = 12, W = box.width + pad;
  const ys = rows.map((r, i) => (i === 0 ? -pad : r.top - box.top));
  ys.push(box.height + pad);
  const poly = (k: number, x: number) =>
    `polygon(${-pad}px ${-pad}px, ${W}px ${-pad}px, ${W}px ${ys[k]}px, ${x}px ${ys[k]}px, ${x}px ${ys[k + 1]}px, ${-pad}px ${ys[k + 1]}px)`;
  const frames: Keyframe[] = [];
  rows.forEach((_, k) => {
    frames.push({ clipPath: poly(k, -pad), offset: k / rows.length });
    frames.push({ clipPath: poly(k, W), offset: (k + 1) / rows.length });
  });
  frames[0].translate = "0 .12em";
  frames[frames.length - 1].translate = "0 0";
  const per = compact ? 520 : 700;
  el.animate(frames, { duration: per * rows.length, easing: "linear", fill: "backwards" })
    .finished.then(() => {}, () => {});
}

export function SectionScrollFx() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    if (reducedMotionMedia().matches) return;
    const compact = window.innerWidth < 701;

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        if (el.contains(document.activeElement)) continue;
        if (el.dataset.sfx === "heading") {
          typeLines(el, compact);
        } else {
          const i = Number(el.dataset.sfxIndex) || 0;
          el.animate([
            { translate: `0 ${compact ? 26 : 46}px`, scale: "0.96" },
            { translate: "0 0", scale: "1" },
          ], { duration: compact ? 600 : 850, delay: Math.min(i, 6) * (compact ? 70 : 110), easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
        }
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    const register = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section")).slice(1); // skip hero
      for (const section of sections) {
        if (section.hasAttribute("data-sfx-section")) continue;
        section.setAttribute("data-sfx-section", "");
        if (section.getBoundingClientRect().top < window.innerHeight * 0.85) continue; // already visible: never flash
        section.querySelectorAll<HTMLElement>("h2").forEach(h => {
          if (h.dataset.sfx) return;
          h.dataset.sfx = "heading"; observer.observe(h);
        });
        cardGroups(section).forEach(group => group.forEach((card, i) => {
          if (card.dataset.sfx) return;
          card.dataset.sfx = "card"; card.dataset.sfxIndex = String(i); observer.observe(card);
        }));
      }
    };
    const timer = window.setTimeout(register, 300);
    let frame = 0;
    const mutations = new MutationObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(register); });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); mutations.disconnect(); observer.disconnect(); };
  }, []);
  return null;
}
