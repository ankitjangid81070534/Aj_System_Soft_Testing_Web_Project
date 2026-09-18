import styles from "./project-edge.module.css";

/** Decorative only: a fixed mask contains the rotating color layer so neither
 * the button nor its label moves. Pair with project-edge.module.css's edge. */
export function ProjectEdge() {
  return <span className={styles.ring} aria-hidden="true" data-project-edge />;
}
