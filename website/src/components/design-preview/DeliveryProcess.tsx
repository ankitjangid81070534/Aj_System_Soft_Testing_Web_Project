"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ClipboardList, Code2, Rocket, ShieldCheck, Wrench } from "lucide-react";
import styles from "./reference.module.css";

const steps = [
  { title: "Discovery & requirements", Icon: ClipboardList, description: "We sit with you (or your team) and map the exact workflows, rules and outcomes the software must support." },
  { title: "Proposal & planning", Icon: ClipboardList, description: "You receive a clear scope, platform recommendation, timeline and transparent estimate — no surprises later." },
  { title: "Design & development", Icon: Code2, description: "We build in iterations you can see and click, refining screens and logic as the product takes shape." },
  { title: "Testing & deployment", Icon: ShieldCheck, description: "Real users test real scenarios before launch; we deploy, migrate data and verify everything in production." },
  { title: "Support & growth", Icon: Wrench, description: "After launch we handle fixes, updates and new features as your business and software grow together." },
];

export function DeliveryProcess() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = matchMedia("(min-width: 1000px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches) return;
      const top = section.getBoundingClientRect().top;
      const distance = Math.max(1, section.offsetHeight - innerHeight + 80);
      const progress = Math.min(1, Math.max(0, (80 - top) / distance));
      setActive(Math.round(progress * (steps.length - 1)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const configure = () => { section.dataset.processPin = String(media.matches); schedule(); };
    configure();
    addEventListener("scroll", schedule, { passive: true }); addEventListener("resize", schedule);
    media.addEventListener("change", configure);
    return () => { cancelAnimationFrame(frame); delete section.dataset.processPin; removeEventListener("scroll", schedule); removeEventListener("resize", schedule); media.removeEventListener("change", configure); };
  }, []);
  const step = steps[active];
  const Icon = step.Icon;
  return (
    <section ref={sectionRef} className={styles.processJourney} id="delivery" data-scroll-scene>
      <div className={`${styles.section} ${styles.process}`}>
      <div className={styles.processArt} aria-hidden="true" data-home-reveal>
        <div className={styles.processRings} />
        <div className={styles.processFloor} /><span className={styles.processSatellite}><Code2 size={23} /></span><span className={styles.processSatelliteTwo}><ShieldCheck size={25} /></span>
        <div className={styles.processCard} key={active} data-process-card>
          <div className={styles.miniCardHeader}><span className={styles.smallIcon}><Icon size={18} /></span><span>{step.title}</span><Check size={16} /></div>
          <div className={styles.wireframe}><span /><span /><span /><span /></div>
          <div className={styles.progressTrack}><span style={{ width: `${(active + 1) * 20}%` }} /></div>
          <div className={styles.miniCardFooter}><span>Requirements-first delivery</span><Rocket size={16} /></div>
        </div>
        <div className={styles.processBase} />
      </div>
      <div className={styles.processCopy} data-home-reveal>
        <p className={styles.eyebrow}>How we work</p>
        <h2 className={styles.processTitle}>From your requirement to a working product</h2>
        <p className={styles.processIntro}>A straightforward five-step delivery process — you always know what is happening and what comes next.</p>
        <div className={styles.stepList} aria-label="Delivery stages">
          {steps.map((item, index) => (
            <button key={item.title} className={`${styles.stepButton} action-control process-stage`} aria-pressed={index === active} aria-controls="delivery-description" onClick={() => setActive(index)}>
              <item.Icon size={18} aria-hidden="true" /><span>{item.title}</span><small>0{index + 1}</small>
            </button>
          ))}
        </div>
        <p id="delivery-description" className={styles.stepDescription} aria-live="polite">{step.description}</p>
        <noscript><ol>{steps.map(item => <li key={item.title}><strong>{item.title}</strong><p>{item.description}</p></li>)}</ol></noscript>
      </div>
      </div>
    </section>
  );
}
