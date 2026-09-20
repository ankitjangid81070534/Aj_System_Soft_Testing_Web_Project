"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./juspay-demo.module.css";

const LINKS = [
  { label: "Products", href: "/services", menu: true },
  { label: "Resources", href: "/blog", menu: true },
  { label: "Projects", href: "/projects" },
  { label: "Company", href: "/about", menu: true },
];

/** Floating pill navigation that compacts after the first scroll. */
export function DemoNav({ brandName }: { brandName: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.navWrap}>
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`} aria-label="Demo navigation">
        <Link href="/juspay-demo" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden />
          {brandName}
        </Link>
        <div className={styles.navLinks}>
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
              {link.menu ? <ChevronDown size={16} aria-hidden /> : null}
            </Link>
          ))}
        </div>
        <div className={styles.navRight}>
          <span className={styles.region}>
            <span className={styles.flag} aria-hidden />
            India
            <ChevronDown size={16} aria-hidden />
          </span>
          <Link href="/contact" className={styles.contactLink}>
            Contact us <ChevronRight size={18} aria-hidden />
          </Link>
        </div>
      </nav>
    </div>
  );
}
