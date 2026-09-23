import { Code2, Cloud, Database, Smartphone } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";


/** The live "A modern, maintainable stack" groups, verbatim. */
const GROUPS = [
  { Icon: Code2, title: "Web & frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST & GraphQL APIs"] },
  { Icon: Smartphone, title: "Mobile", items: ["Android (Kotlin)", "iOS (Swift)", "React Native", "Flutter"] },
  { Icon: Database, title: "Backend & data", items: ["Node.js", "PostgreSQL", "Supabase", "Authentication & RLS", "Background jobs"] },
  { Icon: Cloud, title: "Desktop & cloud", items: [".NET / C#", "Electron", "Windows deployment", "Cloud hosting", "CI/CD"] },
];

/** "Technology" in the dark Juspay-style grid (replaces the legacy TechCapabilities on `/`). */
export function DemoStack({ copy }: { copy: SiteCopy }) {
  return (
    <section className={styles.section} data-home-section="technology">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>{copy.t("home.stack.eyebrow")}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              {copy.t("home.stack.title")} <span className={styles.blue}>{copy.t("home.stack.titleAccent")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>{copy.t("home.stack.lead")}</p>
          </Reveal>
        </div>
        <ScrollScene variant="swing" className={styles.industryGrid}>
          {GROUPS.map(({ Icon, title, items }, index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className={styles.industry} data-tilt>
                <span className={`${styles.iconTile} ${toneFor(index)}`} aria-hidden>
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <ul className={styles.heroTags} aria-label={`${title} technologies`}>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ScrollScene>
      </div>
    </section>
  );
}
