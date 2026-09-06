import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FOOTER_LINK_GROUPS } from "@/lib/navigation";
import { BRAND } from "@/lib/seo/site";
import type { SiteSettings } from "@/lib/data/settings";
import type { PublicNavLink } from "@/lib/data/navigation";
import styles from "./footer.module.css";
import { SocialLinks } from "./SocialLinks";
import { Button } from "./Button";

export function Footer({
  settings,
  managedLinks = [],
}: {
  settings?: SiteSettings | null;
  managedLinks?: readonly PublicNavLink[];
}) {
  const linkGroups = managedLinks.length
    ? [
        { title: "Explore", links: managedLinks },
        ...FOOTER_LINK_GROUPS.slice(1),
      ]
    : FOOTER_LINK_GROUPS;
  const brandName = settings?.brandName || BRAND.primaryName;
  const brandShortName = settings?.brandShortName || BRAND.shortName;
  const tagline = settings?.tagline || BRAND.tagline;

  return (
    <footer className={styles.footer}>
      <section className={styles.cta} aria-labelledby="footer-cta-title">
        <span className={styles.ctaBadge}>Let&apos;s create together</span>
        <h2 id="footer-cta-title">
          <strong>Software built</strong> around your requirements.
        </h2>
        <p className={styles.ctaText}>
          Tell us what your business needs. We will shape the right software, a clear plan and
          a transparent estimate around your workflow.
        </p>
        <Button href="/request-quote" className="mt-7" size="lg">
          Start Your Project <ArrowUpRight aria-hidden="true" size={16} />
        </Button>
      </section>

      <div className={styles.blueField}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.brandBlock}>
              <Link href="/" className={styles.brandLink}>
                <span className={styles.brandMark} aria-hidden="true">AJ</span>
                <span className={styles.brandName}>{brandName}</span>
              </Link>
              <p className={styles.brandCopy}>
                {tagline} Custom software, SaaS platforms, web and mobile apps, desktop software
                and industry-specific business systems.
              </p>
              {settings?.socialLinks && <SocialLinks links={settings.socialLinks} />}
            </div>

            {linkGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <p className={styles.linkGroupTitle}>{group.title}</p>
                <ul className={styles.linkList}>
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className={styles.megaBrand} aria-hidden="true">{brandShortName}</div>
          <div className={styles.bottomRow}>
            <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <p>{tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
