"use client";

import { useState } from "react";
import { AppWindow, Check, Cloud, Code2, FileCode2, KeyRound, LayoutDashboard, Lock, Monitor, Plus, ShieldCheck, Smartphone } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import light from "./demo-light.module.css";

/** The live "Why teams choose AJ System Soft Technology" reasons, verbatim. */
const RESULTS = [
  {
    title: ["Requirements lead,", "code follows"],
    text: "We invest in understanding your process before writing a line of code — the software fits the work, not the reverse.",
    art: "coverage",
  },
  {
    title: ["End-to-end", "delivery"],
    text: "One team handles discovery, design, development, deployment and support — no handover gaps.",
    art: "dial",
  },
  {
    title: ["Security &", "ownership"],
    text: "Role-based access, protected data and a system you own outright — including the source code.",
    art: "secure",
  },
  {
    title: ["Built to be", "maintained"],
    text: "Clean architecture, typed models and documentation mean your software stays changeable for years.",
    art: "cost",
  },
] as const;

const PLATFORM_CHIPS = [
  { Icon: Monitor, label: "Web" },
  { Icon: Smartphone, label: "Mobile" },
  { Icon: AppWindow, label: "Desktop" },
  { Icon: LayoutDashboard, label: "ERP" },
  { Icon: Cloud, label: "Cloud" },
];

function Art({ kind }: { kind: (typeof RESULTS)[number]["art"] }) {
  if (kind === "coverage") {
    return (
      <div className={`${light.art} ${light.artSky}`} aria-hidden>
        <span className={light.cloudA} />
        <span className={light.cloudB} />
        <span className={light.mapDots} />
        <div className={light.currencyRow}>
          {PLATFORM_CHIPS.map(({ Icon, label }) => (
            <span key={label} className={light.currency}>
              <Icon size={20} />
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "dial") {
    return (
      <div className={`${light.art} ${light.artTraces}`} aria-hidden>
        <div className={light.phone}>
          <span className={light.phoneBar}>
            <b>9:41</b>
            <i />
          </span>
          <div className={light.dialWrap}>
            <div className={light.dial}>
              <div className={light.dialFace}>
                <span className={light.dialCore}>
                  <Code2 size={26} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (kind === "secure") {
    return (
      <div className={`${light.art} ${light.artTraces}`} aria-hidden>
        <span className={`${light.verify} ${light.verifyA}`}>
          <Check size={12} /> Role-based access
        </span>
        <span className={`${light.verify} ${light.verifyB}`}>
          <Check size={12} /> Encrypted data
        </span>
        <span className={`${light.verify} ${light.verifyC}`}>
          <Check size={12} /> Audit trail
        </span>
        <span className={`${light.verify} ${light.verifyD}`}>
          <Check size={12} /> Daily backups
        </span>
        <div className={light.sheet}>
          <span className={light.sheetHead}>
            <i /> Admin login
          </span>
          <span className={light.sheetLine} />
          <span className={`${light.sheetLine} ${light.sheetLineShort}`} />
          <div className={light.faceId}>
            <ShieldCheck size={34} strokeWidth={1.4} />
            <small>Secure sign-in</small>
          </div>
          <span className={light.sheetLine} />
        </div>
      </div>
    );
  }
  return (
    <div className={`${light.art} ${light.artPlain}`} aria-hidden>
      <div className={light.greenCard}>
        <span className={light.chipIcon}>
          <FileCode2 size={22} />
        </span>
        <b>Source code · yours</b>
        <span className={light.lockBadge}>
          <Lock size={14} />
        </span>
      </div>
      <div className={light.feeGrid}>
        <span className={light.feeTag}>Documented</span>
        <div className={light.feeTile}>
          <span className={light.feeIcon}>
            <KeyRound size={14} />
          </span>
          <b>100%</b>
          <small>Ownership</small>
        </div>
        <div className={light.feeTile}>
          <span className={light.feeIcon}>
            <Code2 size={14} />
          </span>
          <b>Typed</b>
          <small>Models & APIs</small>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ item, index }: { item: (typeof RESULTS)[number]; index: number }) {
  const [openText, setOpenText] = useState(false);
  return (
    <Reveal delay={index * 0.08}>
      <article className={`${light.resultCard} ${openText ? light.resultOpen : ""}`}>
        <h3>
          {item.title[0]} <span className={styles.blue}>{item.title[1]}</span>
        </h3>
        <Art kind={item.art} />
        <p className={light.resultText}>{item.text}</p>
        <button
          type="button"
          className={light.plus}
          aria-expanded={openText}
          aria-label={openText ? "Hide details" : "Show details"}
          onClick={() => setOpenText((value) => !value)}
        >
          <Plus size={20} aria-hidden />
        </button>
      </article>
    </Reveal>
  );
}

/**
 * "Results that define …" — the reference switches from obsidian to a white
 * canvas here: four tall light cards in a 2×2 grid, each with a two-line title
 * (second line blue), a product illustration and a round "+" that reveals copy.
 */
export function DemoResults({ shortName }: { shortName: string }) {
  return (
    <section id="results" className={light.section}>
      <div className={styles.container}>
        <Reveal>
          <h2 className={light.h2Center}>
            Results that define <span className={styles.blue}>{shortName}</span>
          </h2>
        </Reveal>
        <div className={light.resultGrid}>
          {RESULTS.map((item, index) => (
            <ResultCard key={item.title.join(" ")} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
