import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

/** Final CTA band — the live homepage's "Start a project" finale copy and routes. */
export function DemoCta({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <section id="cta" className={styles.ctaSection} data-home-section="enquiry">
      <div className={styles.ctaGrid} aria-hidden />
      <div className={`${styles.container} ${styles.ctaInner}`}>
        <Reveal>
          <span className={styles.eyebrowPlain}>Start a project</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className={styles.ctaTitle}>
            Ready to build software around
            <br />
            your <span className={styles.blue}>requirements</span>?
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className={styles.lead}>
            Tell us what you need — we will propose the right platform, a clear plan and a transparent estimate.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className={styles.heroActions} style={{ justifyContent: "center" }}>
            <Link href={ctaHref} className={`${styles.pill} ${styles.pillBlue}`}>
              {ctaLabel} <ChevronRight size={18} aria-hidden />
            </Link>
            <Link href="/contact" className={styles.pill}>
              Request a Consultation <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
