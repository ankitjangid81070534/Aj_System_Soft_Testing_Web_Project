import { AppWindow, Cloud, LayoutDashboard, Monitor, Smartphone, Stethoscope } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import light from "./demo-light.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";

/** Live "A modern, maintainable stack" names, laid out like the PSP logo cloud. */
const STACK = [
  { name: "React", x: 28, y: 22 },
  { name: "Next.js", x: 40, y: 12 },
  { name: "TypeScript", x: 52, y: 20 },
  { name: "Node.js", x: 64, y: 10 },
  { name: "PostgreSQL", x: 22, y: 48 },
  { name: "Supabase", x: 36, y: 58 },
  { name: "Kotlin", x: 48, y: 48 },
  { name: "Swift", x: 60, y: 56 },
  { name: "Flutter", x: 72, y: 44 },
  { name: ".NET / C#", x: 32, y: 84 },
  { name: "Electron", x: 50, y: 82 },
  { name: "Tailwind", x: 66, y: 86 },
];

/** Live "One team, every platform" cards → the six routed destinations. */
const LEFT = [
  { Icon: Monitor, label: "Websites & Web Apps" },
  { Icon: Cloud, label: "SaaS Platforms" },
  { Icon: Smartphone, label: "Android & iOS Apps" },
];
const RIGHT = [
  { Icon: AppWindow, label: "Windows Desktop & EXE" },
  { Icon: LayoutDashboard, label: "ERP, CRM & Admin" },
  { Icon: Stethoscope, label: "Industry Software" },
];

/**
 * "Dynamic payment routing for better success rates" → the same diagram: a
 * cloud of stack tiles feeds a yellow line into a 3D dial, which routes out to
 * six labelled nodes. The nodes are the live "One team, every platform" cards.
 */
export function DemoRouting({ copy }: { copy: SiteCopy }) {
  return (
    <section id="routing" className={light.section}>
      <div className={styles.container}>
        <Reveal>
          <h2 className={light.h2Center}>
            {copy.t("home.routing.title")} <span className={styles.blue}>{copy.t("home.routing.titleAccent")}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className={light.leadCenter}>{copy.t("home.routing.lead")}</p>
        </Reveal>

        <div className={light.routing} aria-hidden>
          <div className={light.stackCloud}>
            {STACK.map((item) => (
              <span key={item.name} className={light.stackTile} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
                {item.name}
              </span>
            ))}
            <span className={light.ghostTile} style={{ left: "8%", top: "40%" }} />
            <span className={light.ghostTile} style={{ right: "6%", top: "70%" }} />
            <span className={light.ghostTile} style={{ left: "14%", top: "92%" }} />
          </div>

          <div className={light.feedLine}>
            <i />
          </div>

          <div className={light.routeGrid}>
            <div className={light.routeSide}>
              {LEFT.map(({ Icon, label }) => (
                <div key={label} className={`${light.node}`}>
                  <span className={light.nodeDots} />
                  <Icon size={16} />
                  {label}
                  <span className={light.nodeBox} />
                </div>
              ))}
              <svg className={light.wires} viewBox="0 0 200 300" preserveAspectRatio="none">
                <path d="M0 50 H120 V150 H200" />
                <path d="M0 150 H200" />
                <path d="M0 250 H120 V150" />
                <circle cx="120" cy="50" r="5" />
                <circle cx="120" cy="150" r="5" />
                <circle cx="120" cy="250" r="5" />
                <path className={light.wirePulse} d="M0 50 H120 V150 H200" />
              </svg>
            </div>

            <div className={light.dialBig}>
              <div className={light.dialBigBody}>
                <span className={`${light.corner} ${light.cornerTL}`} />
                <span className={`${light.corner} ${light.cornerTR}`} />
                <span className={`${light.corner} ${light.cornerBL}`} />
                <span className={`${light.corner} ${light.cornerBR}`} />
                <div className={light.dialBigRing}>
                  <div className={light.dialBigTicks} />
                  <div className={light.dialBigCore}>
                    <b>AJ</b>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${light.routeSide} ${light.routeSideRight}`}>
              <svg className={light.wires} viewBox="0 0 200 300" preserveAspectRatio="none">
                <path d="M200 50 H80 V150 H0" />
                <path d="M200 150 H0" />
                <path d="M200 250 H80 V150" />
                <circle cx="80" cy="50" r="5" />
                <circle cx="80" cy="150" r="5" />
                <circle cx="80" cy="250" r="5" />
                <path className={`${light.wirePulse} ${light.wirePulseDelay}`} d="M0 150 H80 V250 H200" />
              </svg>
              {RIGHT.map(({ Icon, label }) => (
                <div key={label} className={`${light.node} ${light.nodeRight}`}>
                  <span className={light.nodeBox} />
                  <Icon size={16} />
                  {label}
                  <span className={light.nodeDots} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
