import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Factory,
  GraduationCap,
  HeartPulse,
  Hotel,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

const INDUSTRIES = [
  { Icon: HeartPulse, label: "Healthcare & clinics" },
  { Icon: ShoppingBag, label: "Retail & ecommerce" },
  { Icon: Factory, label: "Manufacturing" },
  { Icon: Truck, label: "Logistics" },
  { Icon: Hotel, label: "Hotels & hospitality" },
  { Icon: UtensilsCrossed, label: "Restaurants" },
  { Icon: GraduationCap, label: "Education" },
  { Icon: Building2, label: "Professional services" },
];

/** "Take your business to the world" → industry coverage with real counts. */
export function DemoCoverage({ serviceCount }: { serviceCount: number }) {
  return (
    <section id="coverage" className={styles.section}>
      <div className={`${styles.container} ${styles.coverage}`}>
        <div>
          <Reveal>
            <span className={styles.eyebrowPlain}>coverage</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2} style={{ marginTop: 20 }}>
              Take your business <span className={styles.blue}>online</span>, on your terms
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={styles.lead} style={{ marginTop: 20 }}>
              From a single internal tool to a complete system that runs daily operations. Software for the
              way your industry works — built for web, mobile and desktop.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className={styles.coverageStats}>
              <div className={styles.coverageStat}>
                <strong>{serviceCount}</strong>
                <span>Service lines</span>
              </div>
              <div className={styles.coverageStat}>
                <strong>{INDUSTRIES.length}</strong>
                <span>Industries served</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div style={{ marginTop: 40 }}>
              <Link href="/services#service-matcher" className={styles.pill}>
                Find the right service <ChevronRight size={18} aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
        <div className={styles.industryGrid}>
          {INDUSTRIES.map(({ Icon, label }, index) => (
            <Reveal key={label} delay={index * 0.06}>
              <div className={styles.industry}>
                <Icon size={22} aria-hidden />
                {label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
