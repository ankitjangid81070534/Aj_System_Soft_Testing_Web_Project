import { describe, expect, it } from "vitest";
import { clamp, pointerTilt, revealFrames } from "./motion-utils";

describe("presentation motion safety", () => {
  it("clamps scroll progress at both ends", () => {
    expect(clamp(-2)).toBe(0); expect(clamp(2)).toBe(1); expect(clamp(.4)).toBe(.4);
  });
  it("keeps the center of a card level", () => {
    expect(pointerTilt(100, 50, 200, 100)).toEqual({ x: 0, y: 0 });
  });
  it("limits pointer tilt even when the pointer leaves the card", () => {
    expect(pointerTilt(-200, 300, 200, 100)).toEqual({ x: -3.5, y: -3.5 });
    expect(pointerTilt(900, -200, 200, 100)).toEqual({ x: 3.5, y: 3.5 });
  });
  it("never divides by zero for unmounted/hidden cards", () => {
    const result = pointerTilt(0, 0, 0, 0);
    expect(Number.isFinite(result.x) && Number.isFinite(result.y)).toBe(true);
  });
  it("always ends reveals fully visible and level", () => {
    for (const variant of [undefined, "fan", "word"]) {
      const end = revealFrames(variant, false).at(-1)!;
      expect(end.opacity).toBe(1); expect(end.transform).toContain("translate3d(0,0,0)");
    }
  });
  it("reduces perspective/lift on compact screens", () => {
    expect(revealFrames("fan", true)[0].transform).toContain("23px");
    expect(revealFrames("fan", false)[0].transform).toContain("42px");
  });
});
