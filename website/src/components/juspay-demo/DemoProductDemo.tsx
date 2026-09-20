"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

type Screen = {
  id: string;
  trigger: string;
  title: string;
  subtitle: string;
  rows: { label: string; value: string; ok?: boolean }[];
  progress: number;
  cta: string;
};

/** Illustrative screens for the kinds of systems the team builds. */
const SCREENS: Screen[] = [
  {
    id: "clinic",
    trigger: "Hospital & clinic software",
    title: "Today's OPD",
    subtitle: "Reception · Dr. queue · Billing",
    rows: [
      { label: "Appointments", value: "Queue live", ok: true },
      { label: "Patient search", value: "Name · Phone · ID" },
      { label: "Pending bills", value: "3 open" },
    ],
    progress: 72,
    cta: "Register patient",
  },
  {
    id: "pos",
    trigger: "Retail POS & inventory",
    title: "Counter 01",
    subtitle: "Billing · Stock · GST",
    rows: [
      { label: "Cart", value: "4 items" },
      { label: "Stock alert", value: "2 low", ok: false },
      { label: "Payment", value: "UPI · Cash · Card" },
    ],
    progress: 45,
    cta: "Print invoice",
  },
  {
    id: "erp",
    trigger: "ERP & business software",
    title: "Operations",
    subtitle: "Sales · Purchase · Accounts",
    rows: [
      { label: "Purchase orders", value: "Approved", ok: true },
      { label: "Inventory sync", value: "Up to date", ok: true },
      { label: "Month report", value: "Ready to export" },
    ],
    progress: 88,
    cta: "Export report",
  },
  {
    id: "app",
    trigger: "Android & iOS apps",
    title: "Field app",
    subtitle: "Offline-first · Sync on network",
    rows: [
      { label: "Visits today", value: "Logged" },
      { label: "Sync status", value: "Synced", ok: true },
      { label: "Photos", value: "Attached" },
    ],
    progress: 60,
    cta: "Submit visit",
  },
];

/**
 * "Zero-friction" product demo: hover or focus a trigger on the left and the
 * floating device on the right switches screens with a spring transition.
 */
export function DemoProductDemo() {
  const [active, setActive] = useState(SCREENS[0]);
  const reduce = useReducedMotion();

  return (
    <section id="experience" className={styles.section}>
      <div className={styles.container}>
        <Reveal>
          <div className={styles.demoWrap}>
            <div>
              <span className={styles.eyebrowPlain}>experience</span>
              <h2 className={styles.h2} style={{ marginTop: 20 }}>
                Software for every part of your <span className={styles.blue}>business</span>
              </h2>
              <p className={styles.lead} style={{ marginTop: 20 }}>
                Hover a system to preview the kind of screen your team would use every day. Each one is
                built from your workflow — not a template you have to adapt to.
              </p>
              <div className={styles.triggers} aria-label="Product screens">
                {SCREENS.map((screen) => {
                  const isActive = screen.id === active.id;
                  return (
                    <button
                      key={screen.id}
                      type="button"
                      aria-pressed={isActive}
                      className={`${styles.trigger} ${isActive ? styles.triggerActive : ""}`}
                      onMouseEnter={() => setActive(screen)}
                      onFocus={() => setActive(screen)}
                      onClick={() => setActive(screen)}
                    >
                      <span className={styles.triggerLeft}>
                        <span className={styles.triggerDot} aria-hidden />
                        {screen.trigger}
                      </span>
                      <ChevronRight size={18} aria-hidden />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.device} aria-hidden>
              <div className={styles.deviceNotch} />
              <div className={styles.deviceScreen}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.id}
                    className={styles.screen}
                    initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  >
                    <div>
                      <div className={styles.screenTitle}>{active.title}</div>
                      <div className={styles.screenSub}>{active.subtitle}</div>
                    </div>
                    {active.rows.map((row) => (
                      <div key={row.label} className={styles.screenCard}>
                        <b>{row.label}</b>
                        <span className={row.ok ? styles.screenOk : undefined}>{row.value}</span>
                      </div>
                    ))}
                    <div className={styles.screenBar}>
                      <motion.i
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: `${active.progress}%` }}
                        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
                      />
                    </div>
                    <div className={styles.screenCta}>{active.cta}</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
