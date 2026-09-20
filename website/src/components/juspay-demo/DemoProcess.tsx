"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ClipboardList, Code2, FileSearch, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";

/** The live five-step delivery process, verbatim. */
const STEPS: { title: string; Icon: LucideIcon; description: string }[] = [
  { title: "Discovery & requirements", Icon: FileSearch, description: "We sit with you (or your team) and map the exact workflows, rules and outcomes the software must support." },
  { title: "Proposal & planning", Icon: ClipboardList, description: "You receive a clear scope, platform recommendation, timeline and transparent estimate — no surprises later." },
  { title: "Design & development", Icon: Code2, description: "We build in iterations you can see and click, refining screens and logic as the product takes shape." },
  { title: "Testing & deployment", Icon: ShieldCheck, description: "Real users test real scenarios before launch; we deploy, migrate data and verify everything in production." },
  { title: "Support & growth", Icon: Wrench, description: "After launch we handle fixes, updates and new features as your business and software grow together." },
];

function StackCard({ step, index, total }: { step: (typeof STEPS)[number]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end 20%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : 0.55]);

  return (
    <motion.article
      ref={ref}
      className={styles.stackCard}
      style={reduce ? undefined : { scale, opacity, top: `calc(140px + ${index * 16}px)` }}
    >
      <span className={styles.stackIndex}>
        <i aria-hidden /> Step {String(index + 1).padStart(2, "0")} of {total}
      </span>
      <span className={`${styles.iconTile} ${toneFor(index)}`} aria-hidden>
        <step.Icon size={22} />
      </span>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </motion.article>
  );
}

/**
 * Sticky headline on the left and a stack of process cards on the right that
 * scale and dim as the next one slides over — the reference's parallax stack.
 */
export function DemoProcess() {
  return (
    <section id="process" className={styles.section}>
      <div className={`${styles.container} ${styles.outcomes}`}>
        <div className={styles.outcomesSticky}>
          <Reveal>
            <span className={styles.eyebrowPlain}>How we work</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              From your requirement to a <span className={styles.blue}>working product</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={styles.lead}>
              A straightforward five-step delivery process — you always know what is happening and what comes next.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href="/services" className={styles.pill}>
              Explore all services <ChevronRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>
        <div className={styles.stack}>
          {STEPS.map((step, index) => (
            <StackCard key={step.title} step={step} index={index} total={STEPS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
