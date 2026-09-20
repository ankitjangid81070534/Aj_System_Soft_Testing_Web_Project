"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Mail,
  MessageSquareQuote,
  Users,
} from "lucide-react";
import type { ServiceCardModel } from "@/lib/data/services";
import type { PublicNavLink } from "@/lib/data/navigation";
import type { BlogPostTeaser } from "@/lib/data/blog";
import { renderIcon } from "@/components/site/icons";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";

type MenuKind = "services" | "work" | "company";

/** Which live nav labels open a hover panel (Juspay: Products / Resources / Company). */
const MENU_FOR_HREF: Record<string, MenuKind> = {
  "/services": "services",
  "/projects": "work",
  "/about": "company",
};

const WORK_LINKS = [
  { Icon: FolderKanban, label: "Projects", href: "/projects", text: "Public case studies and delivered software across web, mobile, desktop and business systems." },
  { Icon: Bot, label: "AI Methods", href: "/ai-methods", text: "The AI-assisted methods and tools we use during requirements, design, development and QA." },
  { Icon: BookOpen, label: "Blog & Insights", href: "/blog", text: "Practical articles on custom software, platforms and running a business on your own system." },
];

const COMPANY_LINKS = [
  { Icon: Building2, label: "About us", href: "/about", text: "Who we are and how a requirements-first development partner works." },
  { Icon: Users, label: "Team", href: "/team", text: "The engineers and designers who build and maintain your software." },
];
const TOUCH_LINKS = [
  { Icon: Mail, label: "Contact us", href: "/contact", text: "Talk to us about your goals, platforms and key features." },
  { Icon: MessageSquareQuote, label: "Verified Reviews", href: "/reviews", text: "Ratings and feedback from clients on delivered projects." },
];

/**
 * Floating pill navigation with hover mega menus, mirroring juspay.io/in:
 * the pill compacts after the first scroll, and hovering Services / Projects /
 * About drops a wide panel under the bar. Labels and hrefs are the live site's
 * own navigation; the panels list the live services index and public routes.
 */
export function DemoNav({
  brandName,
  navLinks,
  services,
  posts,
  ctaHref,
}: {
  brandName: string;
  navLinks: PublicNavLink[];
  services: ServiceCardModel[];
  posts: BlogPostTeaser[];
  ctaHref: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKind | null>(null);
  const [activeService, setActiveService] = useState(0);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const show = (kind: MenuKind) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(kind);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  const service = services[activeService] ?? services[0];
  const post = posts[0];

  return (
    <div className={styles.navWrap} onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""} ${open ? styles.navOpen : ""}`} aria-label="Demo navigation">
        <Link href="/juspay-demo" className={styles.brand} aria-label={`${brandName} — demo home`}>
          <span className={styles.brandMark} aria-hidden>
            AJ
          </span>
          <span className={styles.brandName}>{brandName}</span>
        </Link>

        <div className={styles.navLinks}>
          {navLinks.map((link) => {
            const kind = MENU_FOR_HREF[link.href];
            if (!kind) {
              return (
                <Link key={link.href} href={link.href} className={styles.navLink} onMouseEnter={() => setOpen(null)}>
                  {link.label}
                </Link>
              );
            }
            const isOpen = open === kind;
            return (
              <button
                key={link.href}
                type="button"
                className={`${styles.navLink} ${isOpen ? styles.navLinkActive : ""}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onMouseEnter={() => show(kind)}
                onFocus={() => show(kind)}
                onClick={() => setOpen(isOpen ? null : kind)}
              >
                {link.label}
                <ChevronDown size={16} aria-hidden className={styles.navChevron} />
              </button>
            );
          })}
        </div>

        <div className={styles.navRight}>
          <span className={styles.region}>
            <span className={styles.flag} aria-hidden />
            India
            <ChevronDown size={16} aria-hidden />
          </span>
          <Link href={ctaHref} className={styles.contactLink}>
            Contact us <ChevronRight size={18} aria-hidden />
          </Link>
        </div>
      </nav>

      {/* ---- Mega panels ------------------------------------------------- */}
      <div className={`${styles.megaWrap} ${open ? styles.megaOpen : ""}`} aria-hidden={!open}>
        {open === "services" && service ? (
          <div className={`${styles.mega} ${styles.megaServices}`} onMouseEnter={cancelClose}>
            <div className={styles.megaList}>
              <span className={styles.megaLabel}>For businesses</span>
              <ul>
                {services.map((item, index) => {
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/services/${item.slug}`}
                        className={`${styles.megaItem} ${index === activeService ? styles.megaItemActive : ""}`}
                        onMouseEnter={() => setActiveService(index)}
                        onFocus={() => setActiveService(index)}
                      >
                        <span className={`${styles.megaItemIcon} ${toneFor(index)}`}>
                          {renderIcon(item.icon, styles.megaItemSvg)}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={styles.megaDetail} key={service.id}>
              <span className={styles.megaLabel}>{service.category}</span>
              <h3>{service.name}</h3>
              <p>{service.shortDescription}</p>
              <ul className={styles.megaBullets}>
                <li>Built from your written requirements</li>
                <li>Source code and documentation handed over</li>
                <li>Maintenance and support after launch</li>
              </ul>
              <Link href={`/services/${service.slug}`} className={styles.megaCta}>
                Explore {service.name} <ArrowRight size={16} aria-hidden />
              </Link>
              <div className={`${styles.megaArt} ${toneFor(activeService)}`} aria-hidden>
                {renderIcon(service.icon, styles.megaArtIcon)}
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        ) : null}

        {open === "work" ? (
          <div className={`${styles.mega} ${styles.megaTwo}`} onMouseEnter={cancelClose}>
            <div className={styles.megaFeature}>
              <span className={styles.megaLabel}>{post ? "From the blog" : "Our work"}</span>
              <div className={styles.megaFeatureArt} aria-hidden>
                <span />
                <span />
                <span />
                <b>AJ</b>
              </div>
              <h3>{post ? post.title : "Software built around your requirements"}</h3>
              <p>
                {post
                  ? post.excerpt
                  : "Custom software, web platforms, SaaS, Android & iOS apps and business automation systems — engineered around your workflows, from first mockup to launch."}
              </p>
              <div className={styles.megaFeatureLinks}>
                <Link href={post ? `/blog/${post.slug}` : "/projects"} className={styles.megaCta}>
                  {post ? "Read the article" : "Explore projects"} <ArrowRight size={16} aria-hidden />
                </Link>
                <Link href={post ? "/blog" : "/services"} className={styles.megaGhost}>
                  {post ? "All articles" : "All services"}
                </Link>
              </div>
            </div>
            <div className={styles.megaColumn}>
              <span className={styles.megaLabel}>Learn &amp; discover</span>
              {WORK_LINKS.map(({ Icon, label, href, text }) => (
                <Link key={href} href={href} className={styles.megaRow}>
                  <span className={styles.megaRowIcon}>
                    <Icon size={16} aria-hidden />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{text}</small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {open === "company" ? (
          <div className={`${styles.mega} ${styles.megaTwo}`} onMouseEnter={cancelClose}>
            <div className={styles.megaColumn}>
              <span className={styles.megaLabel}>Company</span>
              {COMPANY_LINKS.map(({ Icon, label, href, text }) => (
                <Link key={href} href={href} className={styles.megaRow}>
                  <span className={styles.megaRowIcon}>
                    <Icon size={16} aria-hidden />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{text}</small>
                  </span>
                </Link>
              ))}
            </div>
            <div className={styles.megaColumn}>
              <span className={styles.megaLabel}>Stay in touch</span>
              {TOUCH_LINKS.map(({ Icon, label, href, text }) => (
                <Link key={href} href={href} className={styles.megaRow}>
                  <span className={styles.megaRowIcon}>
                    <Icon size={16} aria-hidden />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{text}</small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
