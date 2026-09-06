export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function pointerTilt(x: number, y: number, width: number, height: number) {
  return { x: (0.5 - clamp(y / Math.max(height, 1))) * 7, y: (clamp(x / Math.max(width, 1)) - 0.5) * 7 };
}

export function revealFrames(variant: string | undefined, compact: boolean): Keyframe[] {
  if (variant === "orbit") return [
    { opacity: 0, transform: "translate3d(var(--entry-x,180px),var(--entry-y,120px),0) scale(.12) rotateY(-60deg) rotateZ(30deg)" },
    { opacity: 1, transform: "translate3d(0,0,0) scale(1) rotateY(0) rotateZ(0)" },
  ];
  if (variant === "word") return [
    { opacity: 0, transform: "translate3d(0,.35em,0) rotateX(-12deg)", filter: "blur(5px)" },
    { opacity: 1, transform: "translate3d(0,0,0) rotateX(0)", filter: "blur(0)" },
  ];
  return [
    { opacity: 0, transform: `perspective(1100px) translate3d(${variant === "fan" ? "-18px" : "0"},${compact ? 23 : 42}px,0) rotateX(${compact ? 4 : 8}deg) rotateY(${variant === "fan" ? -12 : 0}deg) scale(.96)` },
    { opacity: 1, transform: "perspective(1100px) translate3d(0,0,0) rotateX(0) rotateY(0) scale(1)" },
  ];
}
