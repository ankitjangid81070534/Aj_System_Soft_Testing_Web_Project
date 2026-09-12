import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Layers3, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/seo/site";
import { OrbitArtwork } from "./OrbitArtwork";
import reference from "./reference.module.css";
import styles from "./home-hero.module.css";

const deliveryPoints = ["Requirements-first delivery", "You own the source code", "Support after launch"];
// Additional existing service families; capabilities, not project/client proof.
const additionalServices = ["Websites & web apps", "Desktop software", "ERP / CRM / POS", "Industry software", "API integrations"];

/** Server-rendered hero shared by Home and /design-preview. Routing stays native. */
export function HomeHero() {
  return (
    <section className={`${reference.hero} ${styles.hero}`} data-home-hero data-scroll-scene aria-labelledby="home-hero-title">
      <OrbitArtwork />
      <div className={`${reference.heroCopy} ${styles.copy}`} data-hero-copy>
        <p className={`${reference.heroBadge} ${styles.badge}`}><Sparkles size={13} aria-hidden="true" />{BRAND.primaryName} — available for new projects</p>
        <h1 id="home-hero-title">Software built around<br />your requirements.</h1>
        <p className={styles.description} data-hero-entrance="lead">Custom software, web platforms, SaaS, Android &amp; iOS apps and business automation systems — engineered around your workflows, from first mockup to launch.</p>
        <div className={styles.actions} data-hero-entrance="actions">
          <Link className={`${styles.primary} action-control action-primary focus-ring`} href="/request-quote">Start Your Project <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <Link className={`${styles.secondary} action-control action-secondary focus-ring`} href="/projects">Explore Projects <Layers3 size={16} aria-hidden="true" /></Link>
        </div>
        <ul className={styles.points} data-hero-entrance="details">{deliveryPoints.map(point => <li key={point}><Check size={13} aria-hidden="true" />{point}</li>)}</ul>
        <ul className={styles.services} data-hero-entrance="details" aria-label="Additional software services">{additionalServices.map(service => <li key={service}>{service}</li>)}</ul>
        <a className={`${styles.explore} focus-ring`} href="#home-services">Explore what we build <ArrowDown size={15} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
