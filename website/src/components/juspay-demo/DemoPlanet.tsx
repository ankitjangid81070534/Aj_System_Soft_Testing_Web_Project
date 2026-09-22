"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Reveal } from "./Reveal";
import { useSiteReducedMotion } from "@/components/motion/motion-preference";
import styles from "./juspay-demo.module.css";

/**
 * Numbers band + planet arc. On juspay.io/in a dark-navy band lists four stats
 * and, as you scroll, a huge glowing sphere rises from below the fold behind
 * "Where everything payments connect". Here the numbers are real counts from
 * the site's own content and the sphere rises the same way (scroll-linked
 * scale / lift; static under reduced motion).
 */
export function DemoPlanet({ serviceCount, benefitCount }: { serviceCount: number; benefitCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useSiteReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 60%"] });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.55, 1.08]), { stiffness: 60, damping: 20 });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ["42%", "0%"]), { stiffness: 60, damping: 20 });
  const glow = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  const STATS = [
    { label: "Service lines", value: `${serviceCount}`, tag: "Across 4 categories" },
    { label: "Platforms", value: "4", tag: "Web · Mobile · Desktop · Cloud" },
    { label: "Industries", value: "8", tag: "Workflow-first software" },
    { label: "Launch benefits", value: `${benefitCount}`, tag: "Included by default" },
  ];

  return (
    <section id="numbers" className={styles.planetSection} ref={ref}>
      <div className={styles.planetStars} aria-hidden />
      <div className={`${styles.container} ${styles.numbers}`}>
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <div className={styles.number}>
              <span className={styles.numberLabel}>{stat.label}</span>
              <strong>{stat.value}</strong>
              <span className={styles.numberTag}>{stat.tag}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <div className={styles.planetStage}>
        <motion.div
          className={styles.planet}
          style={reduce ? undefined : { scale, y }}
          aria-hidden
        >
          <motion.div className={styles.planetGlow} style={reduce ? undefined : { opacity: glow }} />
          <div className={styles.planetRim} />
        </motion.div>
        <div className={styles.planetCopy}>
          <Reveal>
            <h2 className={styles.planetTitle}>
              Where every requirement
              <br />
              becomes software
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.planetLead}>One team for web, mobile, desktop and cloud — from written requirements to a deployment you own.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
