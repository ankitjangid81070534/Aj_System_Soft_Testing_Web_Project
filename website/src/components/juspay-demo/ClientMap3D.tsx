import styles from "./client-map-3d.module.css";

/** Rough continent silhouettes on an 800×400 canvas (same projection as before). */
const CONTINENTS = [
  "M60 60 L150 40 L230 50 L250 80 L230 110 L200 130 L190 165 L165 190 L140 175 L120 150 L90 130 L70 100 Z",
  "M190 205 L230 200 L260 225 L265 265 L245 310 L220 345 L205 340 L195 300 L180 260 Z",
  "M370 55 L430 45 L470 60 L465 95 L430 110 L400 120 L375 100 Z",
  "M380 130 L440 125 L480 150 L490 195 L470 245 L445 285 L420 290 L400 250 L380 205 L370 165 Z",
  "M480 45 L560 35 L650 45 L720 60 L740 95 L700 120 L660 140 L620 150 L600 185 L570 200 L545 170 L515 150 L485 120 L470 90 Z",
  "M640 195 L690 195 L720 215 L700 235 L660 230 L640 215 Z",
  "M665 260 L725 250 L760 275 L750 315 L705 325 L670 300 Z",
];

/**
 * Client locations on the map (800×400 coordinates). OWNER: replace the
 * non-HQ entries with your real client cities. `hq` = company base; arcs
 * are drawn from it to every other point.
 */
const LOCATIONS = [
  { name: "India · HQ", x: 588, y: 176, hq: true },
  { name: "Delhi", x: 584, y: 150 },
  { name: "Mumbai", x: 566, y: 180 },
  { name: "Bengaluru", x: 584, y: 196 },
  { name: "Kolkata", x: 610, y: 168 },
];

export function ClientMap3D() {
  const hq = LOCATIONS.find((l) => l.hq)!;
  return (
    <div className={styles.stage}>
      <div className={styles.plate}>
        <div style={{ position: "relative" }}>
        <svg className={styles.svg} viewBox="0 0 800 400" role="img" aria-label="Map showing our client locations">
          <defs>
            <linearGradient id="cm-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#e6ebf5" />
            </linearGradient>
            <pattern id="cm-dots" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.3" fill="#b9c3d6" />
            </pattern>
            <radialGradient id="cm-glow" r="50%">
              <stop offset="0" stopColor="#3079ea" stopOpacity="0.55" />
              <stop offset="1" stopColor="#3079ea" stopOpacity="0" />
            </radialGradient>
          </defs>

          {CONTINENTS.map((d) => (
            <path key={`s${d}`} d={d} transform="translate(0 7)" className={styles.depth} />
          ))}
          {CONTINENTS.map((d) => (
            <path key={`l${d}`} d={d} fill="url(#cm-land)" className={styles.land} />
          ))}
          {CONTINENTS.map((d) => (
            <path key={`d${d}`} d={d} fill="url(#cm-dots)" opacity="0.7" />
          ))}

          <circle cx={hq.x} cy={hq.y} r="60" fill="url(#cm-glow)" className={styles.halo} />

          {LOCATIONS.filter((l) => !l.hq).map((l, i) => (
            <path
              key={`a${l.name}`}
              d={`M${hq.x} ${hq.y} Q${(hq.x + l.x) / 2} ${Math.min(hq.y, l.y) - 26} ${l.x} ${l.y}`}
              className={styles.arc}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}

          {LOCATIONS.map((l, i) => (
            <g key={l.name} className={styles.pinGroup} style={{ animationDelay: `${i * 0.35}s` }}>
              <circle cx={l.x} cy={l.y} r={l.hq ? 7 : 4.5} className={styles.ring} />
              <circle cx={l.x} cy={l.y} r={l.hq ? 5.5 : 3.2} className={l.hq ? styles.hqDot : styles.dot}>
                <title>{l.name}</title>
              </circle>
            </g>
          ))}
        </svg>

        <span className={styles.label} style={{ left: `${(hq.x / 800) * 100}%`, top: `${(hq.y / 400) * 100}%` }}>
          {hq.name}
        </span>
        </div>
      </div>
      <div className={styles.legend}>
        <span><i className={styles.legendHq} /> Headquarters</span>
        <span><i className={styles.legendClient} /> Client locations</span>
      </div>
    </div>
  );
}
