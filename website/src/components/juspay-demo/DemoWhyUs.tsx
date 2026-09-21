import { ListChecks, Rocket, ShieldCheck, Wrench } from "lucide-react";
import { Reveal } from "./Reveal";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";

/** The live "Why teams choose" reasons, verbatim. */
const REASONS = [
  {
    Icon: ListChecks,
    title: "Requirements lead, code follows",
    description:
      "We invest in understanding your process before writing a line of code — the software fits the work, not the reverse.",
  },
  {
    Icon: Rocket,
    title: "End-to-end delivery",
    description: "One team handles discovery, design, development, deployment and support — no handover gaps.",
  },
  {
    Icon: Wrench,
    title: "Built to be maintained",
    description: "Clean architecture, typed models and documentation mean your software stays changeable for years.",
  },
  {
    Icon: ShieldCheck,
    title: "Security & ownership",
    description: "Role-based access, protected data and a system you own outright — including the source code.",
  },
];

/** "Why AJS Technology" in the dark Juspay-style grid (replaces the legacy WhyUs on `/`). */
export function DemoWhyUs({ brandName }: { brandName: string }) {
  return (
    <section className={styles.section} data-home-section="principles">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>Why AJS Technology</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              Why teams choose <span className={styles.blue}>{brandName}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>A focused development partner that treats your requirements as the specification.</p>
          </Reveal>
        </div>
        <div className={styles.industryGrid}>
          {REASONS.map(({ Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className={styles.industry}>
                <span className={`${styles.iconTile} ${toneFor(index)}`} aria-hidden>
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
