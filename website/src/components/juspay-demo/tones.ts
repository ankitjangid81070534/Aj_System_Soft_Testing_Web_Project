import styles from "./juspay-demo.module.css";

/**
 * Colourful gradient icon tiles — the live site paints each capability with a
 * brand / violet / emerald / cyan / amber / rose gradient. The demo keeps the
 * same six tones so icons read as "professional colour", not flat grey.
 */
export const TONES = [
  styles.toneBlue,
  styles.toneViolet,
  styles.toneEmerald,
  styles.toneCyan,
  styles.toneAmber,
  styles.toneRose,
] as const;

export function toneFor(index: number) {
  return TONES[index % TONES.length];
}
