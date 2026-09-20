import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

/**
 * "By the numbers" band. Values describe the real service catalogue and
 * delivery model — no invented client counts or performance figures.
 */
const NUMBERS = [
  { value: "16", suffix: "", label: "Service lines, from custom software to cloud deployment", tag: "Breadth" },
  { value: "4", suffix: "", label: "Platforms covered: Web, Android, iOS and Windows desktop", tag: "Reach" },
  { value: "100", suffix: "%", label: "Source code ownership handed over with every build", tag: "Ownership" },
  { value: "1", suffix: "", label: "Written requirement spec before a single line is coded", tag: "Clarity" },
];

export function DemoNumbers({ serviceCount }: { serviceCount: number }) {
  return (
    <section id="numbers" className={styles.section}>
      <div className={styles.container}>
        <Reveal>
          <span className={styles.eyebrowPlain}>by the numbers</span>
        </Reveal>
        <div className={styles.numbers}>
          {NUMBERS.map((item, index) => (
            <Reveal key={item.tag} delay={index * 0.1} className={styles.number}>
              <span className={styles.numberTag} aria-hidden />
              <div className={styles.numberValue}>
                {item.tag === "Breadth" ? serviceCount : item.value}
                <b>{item.suffix}</b>
              </div>
              <div className={styles.numberLabel}>{item.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
