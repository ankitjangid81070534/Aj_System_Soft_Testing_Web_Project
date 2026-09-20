import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Projects", href: "/projects" },
      { label: "Reviews", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Custom software", href: "/services/custom-software-development" },
      { label: "Web applications", href: "/services/web-application-development" },
      { label: "SaaS development", href: "/services/saas-development" },
      { label: "Android apps", href: "/services/android-app-development" },
      { label: "ERP & business software", href: "/services/erp-business-software" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "AI methods", href: "/ai-methods" },
      { label: "Request a quote", href: "/request-quote" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function DemoFooter({ brandName, shortName, ctaHref }: { brandName: string; shortName: string; ctaHref: string }) {
  return (
    <>
      <section id="cta" className={styles.ctaBand}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.eyebrowPlain}>get started</span>
            <h2 className={styles.h2} style={{ marginTop: 20 }}>
              Let&apos;s build the system your team <span className={styles.blue}>actually needs</span>
            </h2>
            <Link href={ctaHref} className={`${styles.pill} ${styles.pillBlue}`}>
              Schedule a call <ChevronRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <span className={styles.brand}>
                <span className={styles.brandMark} aria-hidden />
                {shortName}
              </span>
              <p>{brandName} — Software built around your requirements. Web, mobile, desktop and cloud.</p>
            </div>
            {COLUMNS.map((column) => (
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
            <span>© {new Date().getFullYear()} {brandName}. All rights reserved.</span>
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
