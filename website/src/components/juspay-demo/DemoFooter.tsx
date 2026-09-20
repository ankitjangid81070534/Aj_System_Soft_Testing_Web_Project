import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/data/settings";
import { FOOTER_LINK_GROUPS } from "@/lib/navigation";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

/**
 * Final CTA band + big footer. Link groups are the live site's own
 * FOOTER_LINK_GROUPS; contact details come from site settings and are hidden
 * when not configured (same as the live footer).
 */
export function DemoFooter({
  brandName,
  shortName,
  settings,
  ctaHref,
  ctaLabel,
}: {
  brandName: string;
  shortName: string;
  settings: SiteSettings | null;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <>
      <section id="cta" className={styles.ctaSection}>
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

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <span className={styles.brand}>
                <span className={styles.brandMark} aria-hidden>
                  AJ
                </span>
                {brandName}
              </span>
              <p>{settings?.tagline ?? "Software built around your requirements."}</p>
              <ul className={styles.footerContact}>
                {settings?.contactEmail ? (
                  <li>
                    <Mail size={15} aria-hidden /> <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                  </li>
                ) : null}
                {settings?.phone ? (
                  <li>
                    <Phone size={15} aria-hidden /> <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                  </li>
                ) : null}
                {settings?.addressLine ? (
                  <li>
                    <MapPin size={15} aria-hidden /> {settings.addressLine}
                  </li>
                ) : null}
              </ul>
            </div>
            {FOOTER_LINK_GROUPS.map((column) => (
              <div key={column.title}>
                <h2>{column.title}</h2>
                <ul className={styles.footerList}>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={styles.footerBig} aria-hidden>
            {shortName}
          </div>
          <div className={styles.footerBottom}>
            <span>
              © {new Date().getFullYear()} {settings?.companyLegalName ?? brandName}. All rights reserved.
            </span>
            <span>
              <Link href="/privacy">Privacy</Link> · <Link href="/disclaimer">Disclaimer</Link> ·{" "}
              <Link href="/terms">Terms</Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
