import { PLATFORM_ICONS } from "@/components/site/icons";
import { Reveal } from "./Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";

/** The live "One team, every platform" tiles, verbatim (title + description). */
const PLATFORMS = [
  {
    Icon: PLATFORM_ICONS.Monitor,
    title: "Websites & Web Apps",
    description: "Company websites, customer portals and operational web applications built for speed and clarity.",
  },
  {
    Icon: PLATFORM_ICONS.Cloud,
    title: "SaaS Platforms",
    description: "Multi-tenant products with subscriptions, roles, dashboards and the APIs your customers need.",
  },
  {
    Icon: PLATFORM_ICONS.Smartphone,
    title: "Android & iOS Apps",
    description: "Native and cross-platform mobile apps, from customer-facing products to field-work tools.",
  },
  {
    Icon: PLATFORM_ICONS.AppWindow,
    title: "Windows Desktop & EXE",
    description: "Desktop software for shops, offices and labs that needs to run reliably on local machines.",
  },
  {
    Icon: PLATFORM_ICONS.LayoutDashboard,
    title: "ERP, CRM & Admin Panels",
    description: "Business systems that connect sales, stock, accounts and reporting in one manageable place.",
  },
  {
    Icon: PLATFORM_ICONS.Stethoscope,
    title: "Industry-Specific Software",
    description: "Hospital, clinic, pharmacy, retail POS, inventory and hotel software shaped by real workflows.",
  },
];

/** "What we build" in the dark Juspay-style card grid (replaces the legacy PlatformsShowcase on `/`). */
export function DemoPlatforms() {
  return (
    <section className={styles.section} data-home-section="platforms">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>What we build</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              One team, <span className={styles.blue}>every platform</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>
              Tell us the problem — we propose the right platform and architecture for it, not the other way around.
            </p>
          </Reveal>
        </div>
        <ScrollScene variant="rise" className={styles.cardGrid}>
          {PLATFORMS.map(({ Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className={styles.industry} data-tilt>
                <span className={`${styles.iconTile} ${toneFor(index)}`} aria-hidden>
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </Reveal>
          ))}
        </ScrollScene>
      </div>
    </section>
  );
}
