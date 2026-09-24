import Link from "next/link";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";


/** Final CTA band — the live homepage's "Start a project" finale copy and routes. */
export function DemoCta({ ctaHref, ctaLabel, copy }: { ctaHref: string; ctaLabel: string; copy: SiteCopy }) {
  return (
    <section id="cta" className={styles.ctaSection} data-home-section="enquiry">
      <div className={styles.ctaGrid} aria-hidden />
      <div className={`${styles.container} ${styles.ctaInner}`}>
        <Reveal>
          <span className={styles.eyebrowPlain}>{copy.t("home.cta.eyebrow")}</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className={styles.ctaTitle}>
            {copy.t("home.cta.titleLine1")}
            <br />
            {copy.t("home.cta.titleLine2")} <span className={styles.blue}>{copy.t("home.cta.titleAccent")}</span>?
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className={styles.lead}>{copy.t("home.cta.lead")}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className={styles.heroActions} style={{ justifyContent: "center" }}>
            <Link href={ctaHref} className={`${styles.pill} ${styles.pillBlue}`}>
              {ctaLabel} <ChevronRight size={18} aria-hidden />
            </Link>
            <Link href="/contact" className={styles.pill}>
              {copy.t("home.cta.secondaryLabel")} <ChevronRight size={18} aria-hidden />
            </Link>
            <Link href="/contact#consultation" className={styles.pill}>
              <CalendarCheck size={18} aria-hidden /> Book an appointment
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
