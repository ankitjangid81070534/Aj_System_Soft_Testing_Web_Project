import type { CSSProperties } from "react";
import { Braces, Code2, Database, Globe2, Layers3, Monitor, Smartphone, Workflow } from "lucide-react";
import styles from "./reference.module.css";

const objects = [
  { Icon: Braces, x: 8, y: 30, size: 54, color: "mint", rotation: -19 },
  { Icon: Database, x: 15, y: 60, size: 42, color: "violet", rotation: 23 },
  { Icon: Globe2, x: 28, y: 78, size: 64, color: "gold", rotation: -24 },
  { Icon: Workflow, x: 43, y: 89, size: 50, color: "violet", rotation: 24 },
  { Icon: Layers3, x: 60, y: 83, size: 54, color: "pink", rotation: -22 },
  { Icon: Code2, x: 76, y: 74, size: 66, color: "blue", rotation: 18 },
  { Icon: Monitor, x: 89, y: 52, size: 50, color: "violet", rotation: 14 },
  { Icon: Smartphone, x: 93, y: 25, size: 44, color: "gold", rotation: -23 },
  { Icon: Layers3, x: 2, y: 9, size: 28, color: "pink", rotation: -30 },
  { Icon: Braces, x: 98, y: 5, size: 28, color: "violet", rotation: 15 },
];

/** Lightweight decorative geometry, not a video, canvas or invented product data. */
export function OrbitArtwork({ finale = false }: { finale?: boolean }) {
  return (
    <div className={`${styles.orbit} ${finale ? styles.orbitFinale : ""}`} aria-hidden="true">
      <div className={styles.orbitTrail} />
      {objects.map(({ Icon, x, y, size, color, rotation }, index) => (
        <span key={index} className={styles.orbitPosition} style={{
          "--x": `${x}%`, "--y": `${y}%`, "--size": `${size}px`,
          "--rotation": `${rotation}deg`, "--delay": `${-index * 0.73}s`,
          "--entry-delay": `${140 + (objects.length - 1 - index) * 100}ms`,
          "--entry-x": `${100 + (100 - x) * 2}px`, "--entry-y": `${80 + (100 - y)}px`,
        } as CSSProperties}>
          <span className={styles.orbitEntrance} data-orbit-entry data-reveal="orbit">
            <span className={styles.orbitFloat}>
              <span className={`${styles.orbitToken} ${styles[color]}`}><Icon strokeWidth={1.7} /></span>
            </span>
          </span>
        </span>
      ))}
      {Array.from({ length: 76 }, (_, index) => {
        const angle = (index / 75) * Math.PI;
        return <i key={index} className={styles.particle} style={{
          left: `${50 + Math.cos(angle) * (43 + (index % 4) * 2)}%`,
          top: `${18 + Math.sin(angle) * (57 + (index % 5) * 4)}%`,
          "--delay": `${-index * 0.31}s`,
          "--size": `${3 + (index % 4) * 2}px`,
        } as CSSProperties} />;
      })}
    </div>
  );
}
