import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { DemoCta } from "./DemoCta";
import type { SiteSettings } from "@/lib/data/settings";
import { FOOTER_LINK_GROUPS } from "@/lib/navigation";
import type { SiteCopy } from "@/lib/data/site-copy";
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
  copy,
}: {
  brandName: string;
  shortName: string;
  settings: SiteSettings | null;
  ctaHref: string;
  ctaLabel: string;
  copy: SiteCopy;
}) {
  return (
    <>
      <DemoCta ctaHref={ctaHref} ctaLabel={ctaLabel} copy={copy} />

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
