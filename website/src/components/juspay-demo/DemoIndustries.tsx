import Link from "next/link";
import { Briefcase, ChevronRight, Factory, GraduationCap, Hotel, Pill, Stethoscope, Store, Truck } from "lucide-react";
import { Reveal } from "./Reveal";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";

/** The live Industries tiles, verbatim (label + workflow example). */
const INDUSTRIES = [
  { Icon: Stethoscope, label: "Healthcare & clinics", workflow: "Appointments, patient records and billing" },
  { Icon: Pill, label: "Pharmacy & medical stores", workflow: "Medicine batches, expiry tracking and counter billing" },
  { Icon: Store, label: "Retail & shops", workflow: "Point of sale, stock, returns and daily closing" },
  { Icon: Hotel, label: "Hotels & hospitality", workflow: "Room availability, check-ins and housekeeping" },
  { Icon: Factory, label: "Manufacturing", workflow: "Purchasing, inventory and operational reporting" },
  { Icon: Truck, label: "Logistics & distribution", workflow: "Orders, dispatch workflows and system integrations" },
  { Icon: GraduationCap, label: "Education & institutes", workflow: "Browser-based portals, records and staff workflows" },
  { Icon: Briefcase, label: "Professional services", workflow: "Customer portals, follow-ups and internal tools" },
];

export function DemoIndustries() {
  return (
    <section id="industries" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>Industries</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              Software for the way your <span className={styles.blue}>industry works</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={styles.lead}>Every trade has its own rules, documents and workflows. We build around them.</p>
          </Reveal>
        </div>
        <div className={styles.industryGrid}>
          {INDUSTRIES.map(({ Icon, label, workflow }, index) => (
            <Reveal key={label} delay={index * 0.05}>
              <div className={styles.industry}>
                <span className={`${styles.iconTile} ${toneFor(index)}`} aria-hidden>
                  <Icon size={20} />
                </span>
                <h3>{label}</h3>
                <p>{workflow}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className={styles.inlineLinks}>
            <Link href="/services#service-matcher">
              Find the right service <ChevronRight size={16} aria-hidden />
            </Link>
            <Link href="/services#solution-comparison">
              Compare solutions <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
