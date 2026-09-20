"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ChevronRight, Cloud, LayoutGrid, Smartphone, Workflow } from "lucide-react";
import type { MouseEvent } from "react";
import styles from "./juspay-demo.module.css";

const CHIPS = [
  { Icon: LayoutGrid, label: "Web apps", style: { left: "6%", top: "58%" } },
  { Icon: Smartphone, label: "Android & iOS", style: { right: "6%", top: "60%" } },
  { Icon: Workflow, label: "ERP & workflows", style: { right: "12%", top: "8%" } },
  { Icon: Cloud, label: "Cloud deploy", style: { left: "12%", top: "6%" } },
];

/**
 * Hero: eyebrow, two-line headline with a blue first word, lead copy and a
 * pill CTA on the left; a grid-framed 3D core that tilts with the pointer on
 * the right — mirroring the Juspay landing composition.
 */
export function DemoHero({ ctaHref }: { ctaHref: string }) {
  const reduce = useReducedMotion();
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

  // Hero copy is server-rendered and still (like the live site); only the core moves.
  return (
    <section className={styles.hero} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className={styles.heroGrid} aria-hidden />
      <div className={styles.heroGlow} aria-hidden />
      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <div>
            <span className={styles.eyebrow}>Software engineering partner</span>
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.blue}>Software</span> built around your requirements
          </h1>
          <p className={styles.heroLead}>
            AJ System Soft Technology designs and builds custom software, web platforms, mobile apps and
            business systems that fit the way your team actually works — from written requirements to a
            deployment you own outright.
          </p>
          <div className={styles.heroActions}>
            <Link href={ctaHref} className={styles.pill}>
              Schedule a call <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
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
          </svg>

          <motion.div className={styles.core} style={{ rotateX: rx, rotateY: ry }}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
            <div className={styles.orb} />
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

          {CHIPS.map(({ Icon, label, style }) => (
            <motion.div key={label} className={styles.chip} style={{ ...style, x: chipX, y: chipY }}>
              <span className={styles.chipIcon}>
                <Icon size={20} />
              </span>
              <span className={styles.chipLabel}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
