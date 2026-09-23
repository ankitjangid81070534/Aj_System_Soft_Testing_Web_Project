import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ServiceTeaser } from "@/lib/data/mappers";
import { Reveal } from "./Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";


/**
 * Every published service, in the dark card grid. Heading copy and the
 * "Explore all services" route are the live homepage's own — nothing is
 * dropped when the demo look replaces the previous services journey.
 */
export function DemoServices({ services, copy }: { services: ServiceTeaser[]; copy: SiteCopy }) {
  if (services.length === 0) return null;
  return (
    <section id="home-services" className={styles.section} data-home-section="services">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>{copy.t("home.services.eyebrow")}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              {copy.t("home.services.title")} <span className={styles.blue}>{copy.t("home.services.titleAccent")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>{copy.t("home.services.lead")}</p>
          </Reveal>
        </div>
        <ScrollScene variant="rise" className={styles.cardGrid}>
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.06}>
              <Link href={`/services/${service.slug}`} className={styles.darkCard} data-tilt>
                <span className={`${styles.cardStripe} ${toneFor(index)}`} aria-hidden />
                <span className={styles.cardMeta}>{service.category}</span>
                <h3>{service.name}</h3>
                <p>{service.shortDescription}</p>
                <small>
                  Learn more <ChevronRight size={14} aria-hidden />
                </small>
              </Link>
            </Reveal>
          ))}
        </ScrollScene>
        <Reveal delay={0.1}>
          <div className={styles.heroActions} style={{ justifyContent: "center", marginTop: 40 }}>
            <Link href="/services" className={`${styles.pill} ${styles.pillBlue}`}>
              {copy.t("home.services.allLabel")} <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
