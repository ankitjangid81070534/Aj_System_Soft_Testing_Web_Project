import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import light from "./demo-light.module.css";

/**
 * Rough continent silhouettes (800×400 equirectangular-ish) filled with a dot
 * pattern — the reference draws its world map the same way, with the home
 * market marked in colour. India is the marked point here.
 */
const CONTINENTS = [
  // North America
  "M60 60 L150 40 L230 50 L250 80 L230 110 L200 130 L190 165 L165 190 L140 175 L120 150 L90 130 L70 100 Z",
  // South America
  "M190 205 L230 200 L260 225 L265 265 L245 310 L220 345 L205 340 L195 300 L180 260 Z",
  // Europe
  "M370 55 L430 45 L470 60 L465 95 L430 110 L400 120 L375 100 Z",
  // Africa
  "M380 130 L440 125 L480 150 L490 195 L470 245 L445 285 L420 290 L400 250 L380 205 L370 165 Z",
  // Asia
  "M480 45 L560 35 L650 45 L720 60 L740 95 L700 120 L660 140 L620 150 L600 185 L570 200 L545 170 L515 150 L485 120 L470 90 Z",
  // South-east Asia / Indonesia
  "M640 195 L690 195 L720 215 L700 235 L660 230 L640 215 Z",
  // Australia
  "M665 260 L725 250 L760 275 L750 315 L705 325 L670 300 Z",
];

export function DemoWorld({ serviceCount, ctaHref, ctaLabel }: { serviceCount: number; ctaHref: string; ctaLabel: string }) {
  return (
    <section id="coverage" className={light.section}>
      <div className={`${styles.container} ${light.world}`}>
        <div>
          <Reveal>
            <h2 className={light.h2}>
              You own your <span className={styles.blue}>software</span>.
              <br />
              We help it grow.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={light.lead}>
              Source code and documentation <strong>handed over with the build</strong>. Ongoing care after launch —
              updates, fixes and improvements. Software for the way your industry works, built for{" "}
              <strong>web, mobile and desktop</strong>.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className={light.worldStats}>
              <div>
                <strong>{serviceCount}</strong>
                <span>Service lines</span>
              </div>
              <div>
                <strong>8</strong>
                <span>Industries served</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href={ctaHref} className={light.pillDark}>
              {ctaLabel} <ChevronRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>

        <Reveal className={light.mapWrap} delay={0.15}>
          <svg className={light.map} viewBox="0 0 800 400" role="img" aria-label="World map with India marked">
            <defs>
              <pattern id="jd-dots" width="9" height="9" patternUnits="userSpaceOnUse">
                <circle cx="4.5" cy="4.5" r="2.1" fill="#c9ccd4" />
              </pattern>
              <radialGradient id="jd-pin" r="50%">
                <stop offset="0" stopColor="#3079ea" />
                <stop offset="1" stopColor="#3079ea" stopOpacity="0" />
              </radialGradient>
            </defs>
            {CONTINENTS.map((d) => (
              <path key={d} d={d} fill="url(#jd-dots)" />
            ))}
            <circle cx="588" cy="176" r="34" fill="url(#jd-pin)" className={light.pinGlow} />
            <g className={light.pin}>
              <rect x="578" y="166" width="20" height="20" rx="5" fill="#3079ea" />
              <rect x="583" y="171" width="4" height="4" fill="#fff" />
              <rect x="589" y="171" width="4" height="4" fill="#fff" />
              <rect x="583" y="177" width="4" height="4" fill="#fff" />
              <rect x="589" y="177" width="4" height="4" fill="#00b40a" />
            </g>
          </svg>
        </Reveal>
      </div>
    </section>
  );
}
