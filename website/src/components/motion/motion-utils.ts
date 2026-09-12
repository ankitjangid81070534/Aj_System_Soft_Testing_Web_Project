export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function pointerTilt(x: number, y: number, width: number, height: number) {
  return { x: (0.5 - clamp(y / Math.max(height, 1))) * 7, y: (clamp(x / Math.max(width, 1)) - 0.5) * 7 };
}

export function revealFrames(variant: string | undefined, compact: boolean, nestedWord = false): Keyframe[] {
  if (variant === "orbit") return [
    { opacity: 0, transform: "translate3d(var(--entry-x,180px),var(--entry-y,120px),0) scale(.12) rotateY(-60deg) rotateZ(30deg)" },
    { opacity: 1, transform: "translate3d(0,0,0) scale(1) rotateY(0) rotateZ(0)" },
  ];
  if (variant === "word") return [
    { ...(nestedWord ? {} : { opacity: 0.01 }), transform: "translate3d(0,.25em,0)" },
    { ...(nestedWord ? {} : { opacity: 1 }), transform: "translate3d(0,0,0)" },
  ];
  return [
    { opacity: 0.01, transform: `translate3d(${variant === "fan" && !compact ? "-8px" : "0"},${compact ? 10 : 20}px,0)` },
    { opacity: 1, transform: "translate3d(0,0,0)" },
  ];
}
