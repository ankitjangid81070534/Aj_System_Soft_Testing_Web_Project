import { cn } from "@/lib/utils/cn";
import styles from "./hero-scene.module.css";

export type HeroSceneVariant =
  | "core"
  | "card"
  | "rack"
  | "stack"
  | "orbit"
  | "tiles"
  | "pages"
  | "nodes";

export type HeroTone = "blue" | "green" | "purple" | "amber" | "teal" | "cyan" | "indigo" | "rose";

export const HERO_TONES: Record<HeroTone, string> = {
  blue: "#3079ea",
  green: "#22c55e",
  purple: "#8b5cf6",
  amber: "#f59e0b",
  teal: "#14b8a6",
  cyan: "#22d3ee",
  indigo: "#6366f1",
  rose: "#f43f5e",
};

const PART_COUNT: Record<HeroSceneVariant, number> = {
  core: 5,
  card: 4,
  rack: 6,
  stack: 4,
  orbit: 5,
  tiles: 4,
  pages: 4,
  nodes: 8,
};

/**
 * Juspay-style 3D hero artwork, one scene per page, built from pure CSS
 * (no images, no JS). Decorative only — always `aria-hidden`. The pointer
 * tilt comes from the site-wide `TiltEngine` via `data-tilt`; scroll depth
 * from `--scene-progress` on the parent hero. Reduced motion settles every
 * scene into its resting pose.
 */
export function HeroScene({ variant, className }: { variant: HeroSceneVariant; className?: string }) {
  return (
    <div className={cn(styles.stage, className)} aria-hidden="true">
      <div className={cn(styles.scene, styles[variant])} data-tilt>
        {Array.from({ length: PART_COUNT[variant] }, (_, index) => (
          <i key={index} className={styles[`p${index + 1}`]} />
        ))}
      </div>
    </div>
  );
}
