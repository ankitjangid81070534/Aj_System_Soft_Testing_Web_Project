import type { CSSProperties } from "react";
import { Braces, Code2, Database, Globe2, Layers3, ShieldCheck, Smartphone, Workflow } from "lucide-react";
import styles from "./sculptural-scenes.module.css";

const cards = [
  { Icon: Code2, label: "Requirements-first" },
  { Icon: Layers3, label: "Web · SaaS · Apps" },
  { Icon: ShieldCheck, label: "You own the source code" },
  { Icon: Workflow, label: "Requirements-first" },
  { Icon: Globe2, label: "Web · SaaS · Apps" },
  { Icon: Database, label: "You own the source code" },
];

/** Decorative representations of the existing capability copy, not fake data. */
export function OwnershipOrbit() {
  return <div className={styles.orbit} aria-hidden="true">
    <div className={styles.axisLight} /><div className={styles.groundRing} />
    <div className={styles.cardRing}>
      {cards.map(({ Icon, label }, index) => <div className={styles.orbitCard} key={index} style={{ "--angle": `${index * 60}deg` } as CSSProperties}>
        <Icon size={26} strokeWidth={1.35} /><span>{label}</span>
        <div className={styles.cardLines}><i /><i /><i /></div>
        <div className={styles.cardGraph}><i /><i /><i /><i /><i /></div>
      </div>)}
    </div>
    <div className={styles.centerMark}><Layers3 size={42} strokeWidth={1.2} /></div>
  </div>;
}

const shapes = [Layers3, Braces, Database, Globe2, Code2, Smartphone, Workflow, ShieldCheck];
export function CosmicBackdrop() {
  return <div className={styles.cosmos} aria-hidden="true">
    <div className={styles.halo} /><div className={styles.cosmicCore}><Layers3 size={48} strokeWidth={1.2} /></div>
    {Array.from({ length: 24 }, (_, index) => <i key={index} className={styles.ray} style={{ "--angle": `${index * 15}deg`, "--ray-size": `${28 + index % 4 * 9}%` } as CSSProperties} />)}
    {shapes.map((Icon, index) => {
      const angle = index / shapes.length * Math.PI * 2;
      return <span key={index} className={`${styles.cosmicObject} ${styles[`object${index % 4}`]}`} style={{ left: `${50 + Math.cos(angle) * 40}%`, top: `${37 + Math.sin(angle) * 29}%`, "--angle": `${index * 27}deg`, "--object-delay": `${index * -.7}s`, "--depth": index % 2 ? "120px" : "-100px" } as CSSProperties}><Icon strokeWidth={1.25} /></span>;
    })}
    <div className={styles.petal} /><div className={styles.petalTwo} /><div className={styles.cosmicScrim} />
  </div>;
}
