"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AppWindow, Check, ChevronRight, Cloud, LayoutDashboard, Layers3, Monitor, Smartphone } from "lucide-react";
import type { MouseEvent } from "react";
import { useSiteReducedMotion } from "@/components/motion/motion-preference";
import styles from "./juspay-demo.module.css";

/** The live hero's delivery points and additional service families, verbatim. */
const DELIVERY_POINTS = ["Requirements-first delivery", "You own the source code", "Support after launch"];
const ADDITIONAL_SERVICES = ["Websites & web apps", "Desktop software", "ERP / CRM / POS", "Industry software", "API integrations"];

const CHIPS = [
  { Icon: Monitor, label: "Websites & web apps", tone: styles.toneBlue, style: { left: "4%", top: "60%" } },
  { Icon: Smartphone, label: "Android & iOS apps", tone: styles.toneEmerald, style: { right: "4%", top: "62%" } },
  { Icon: LayoutDashboard, label: "ERP, CRM & admin panels", tone: styles.toneAmber, style: { right: "8%", top: "6%" } },
  { Icon: Cloud, label: "SaaS platforms", tone: styles.toneViolet, style: { left: "8%", top: "4%" } },
  { Icon: AppWindow, label: "Windows desktop & EXE", tone: styles.toneCyan, style: { left: "36%", top: "88%" } },
];

/**
 * Hero: eyebrow, two-line headline with a blue lead word, the live site's own
 * description and CTAs on the left; a 3D core that tilts with the pointer on
 * the right — mirroring the Juspay landing composition. The background is a
 * smooth black canvas with one soft glow (no grid lines).
 */
export function DemoHero({ ctaHref, ctaLabel, brandName }: { ctaHref: string; ctaLabel: string; brandName: string }) {
  const reduce = useSiteReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 80, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 80, damping: 18 });
  const chipX = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 60, damping: 16 });
  const chipY = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 60, damping: 16 });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className={styles.hero} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className={styles.heroGlow} aria-hidden />
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <div>
            <span className={styles.eyebrow}>{brandName} — software development</span>
          </div>
          <h1 className={styles.heroTitle}>
            <span className={`${styles.blue} ${styles.heroAccent}`}>Software</span> built around your requirements.
          </h1>
          <p className={styles.heroLead}>
            Custom software, web platforms, SaaS, Android &amp; iOS apps and business automation systems — engineered
            around your workflows, from first mockup to launch.
          </p>
          <div className={styles.heroActions}>
            <Link href={ctaHref} className={`${styles.pill} ${styles.pillBlue}`}>
              {ctaLabel} <ChevronRight size={18} aria-hidden />
            </Link>
            <Link href="/projects" className={styles.pill}>
              Explore Projects <Layers3 size={17} aria-hidden />
            </Link>
          </div>
          <ul className={styles.heroPoints}>
            {DELIVERY_POINTS.map((point) => (
              <li key={point}>
                <Check size={14} aria-hidden /> {point}
              </li>
            ))}
          </ul>
          <ul className={styles.heroTags} aria-label="Additional software services">
            {ADDITIONAL_SERVICES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.coreStage} aria-hidden>
          <div className={styles.coreFrame} />
          <svg className={styles.circuit} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M8 40 H30 V22 H50 V40" />
            <path d="M92 60 H70 V78 H50 V60" />
            <path d="M50 8 V26" />
            <path d="M50 92 V74" />
            <path d="M8 66 H26 V54" />
            <path d="M92 34 H74 V46" />
            <path className={styles.pulse} d="M8 40 H30 V22 H50 V40" />
            <path className={`${styles.pulse} ${styles.pulseDelay}`} d="M92 60 H70 V78 H50 V60" />
            <path className={`${styles.pulse} ${styles.pulseDelay2}`} d="M50 92 V74" />
          </svg>

          <motion.div className={styles.core} style={{ rotateX: rx, rotateY: ry }}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={styles.orb}>
              <b>AJ</b>
            </div>
            <div className={`${styles.led} ${styles.ledLeft}`}>
              <span />
              <span />
              <span />
            </div>
            <div className={`${styles.led} ${styles.ledRight}`}>
              <span />
              <span />
              <span />
            </div>
          </motion.div>

          {CHIPS.map(({ Icon, label, tone, style }) => (
            <motion.div key={label} className={styles.chip} style={{ ...style, x: chipX, y: chipY }}>
              <span className={`${styles.chipIcon} ${tone}`}>
                <Icon size={14} aria-hidden />
              </span>
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
