import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { revealFrames } from "./motion-utils";

const reveal = readFileSync(new URL("../site/RevealObserver.tsx", import.meta.url), "utf8");
const scene = readFileSync(new URL("./SceneMotion.tsx", import.meta.url), "utf8");
const journey = readFileSync(new URL("../design-preview/ScrollJourney.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../design-preview/home-motion.module.css", import.meta.url), "utf8");

describe("Phase 6 motion safeguards", () => {
  it("declares smooth scrolling so route transitions can temporarily disable it", () => {
    const layout = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8");
    expect(layout).toMatch(/<html\b[^>]*data-scroll-behavior="smooth"/);
  });
  it("keeps nested desktop word movement without a second opacity fade", () => {
    const frames = revealFrames("word", false, true);
    expect(frames.every(frame => frame.opacity === undefined)).toBe(true);
    expect(frames[0].transform).toContain(".25em");
    expect(frames.at(-1)?.transform).toBe("translate3d(0,0,0)");
  });
  it("retains the standalone word entrance", () => {
    expect(revealFrames("word", false)[0].opacity).toBe(.01);
    expect(revealFrames("word", false).at(-1)?.opacity).toBe(1);
  });
  it("consumes entrances before running them and never rearms them on exit", () => {
    expect(reveal.indexOf('element.dataset.revealCycle = "1"', reveal.indexOf('new IntersectionObserver'))).toBeLessThan(reveal.indexOf('element.animate('));
    expect(reveal).not.toContain('delete element.dataset.revealCycle');
    expect(reveal).toContain('const compactWord');
  });
  it("cancels moving ancestors on focus and pending work on unmount", () => {
    expect(reveal).toContain('element.contains(event.target)');
    expect(reveal).toContain('registration.cancel()');
    expect(reveal).toContain('document.removeEventListener("focusin", focus)');
  });
  it("pauses decorative loops while hidden and cleans up visibility listeners", () => {
    for (const source of [scene, journey]) {
      expect(source).toContain('document.hidden');
      expect(source).toContain('document.removeEventListener("visibilitychange", visibility)');
    }
  });
  it("provides stacked content for short screens and reduced motion", () => {
    expect(journey).toContain('(min-height: 760px)');
    expect(journey).toContain('enabled ? "horizontal" : "stacked"');
    expect(journey).toContain('(prefers-reduced-motion: no-preference)');
    expect(journey).toContain('update(true)');
  });
  it("clips the track without creating a competing keyboard scroll container", () => {
    const reference = readFileSync(new URL("../design-preview/reference.module.css", import.meta.url), "utf8");
    expect(reference).toContain('.journeyStage { overflow: clip; }');
    expect(journey).toContain('behavior: "instant"');
  });
  it("never intercepts wheel/touch scrolling or captures a pointer", () => {
    for (const source of [reveal, scene, journey]) expect(source).not.toMatch(/preventDefault|setPointerCapture|addEventListener\("(?:wheel|touchmove)"/);
    expect(scene).not.toContain('scrollTo');
  });
  it("adds finite transform-only hero layers without hiding the heading", () => {
    const layer = css.split('@keyframes settle-layer {')[1].split('@media')[0];
    expect(layer).not.toContain('opacity');
    expect(css).not.toMatch(/infinite|display:\s*none|visibility:\s*hidden|will-change/);
    expect(css).toContain('prefers-reduced-motion: no-preference');
    expect(css).toContain('[data-hero-copy]:focus-within');
  });
});
