import { LifeBuoy, LayoutDashboard, Search, Sliders, Smartphone, Sparkles, Zap, type LucideIcon } from "lucide-react";
import type { LaunchBenefit } from "@/lib/data/growth";
import { Reveal } from "./Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";
import light from "./demo-light.module.css";

const ICONS: Record<string, LucideIcon> = {
  "life-buoy": LifeBuoy,
  sliders: Sliders,
  smartphone: Smartphone,
  search: Search,
  "layout-dashboard": LayoutDashboard,
  sparkles: Sparkles,
};

/**
 * The reference closes its light run with three framed cards whose thumbnails
 * are soft blue gradients carrying small floating UI. Here the cards are the
 * live "What's included with every project" launch benefits.
 */
export function DemoTriad({ benefits }: { benefits: LaunchBenefit[] }) {
  if (benefits.length === 0) return null;
  return (
    <section id="included" className={light.section}>
      <div className={styles.container}>
        <Reveal>
          <span className={light.eyebrow}>Launch benefits</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className={light.h2Center}>
            What&apos;s included with <span className={styles.blue}>every project</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className={light.leadCenter}>
            Our service goes beyond just writing code. Every custom software project includes these benefits by
            default.
          </p>
        </Reveal>
        <ScrollScene variant="rise" className={light.triad}>
          {benefits.map((benefit, index) => {
            const Icon = ICONS[benefit.icon ?? ""] ?? Zap;
            return (
              <Reveal key={benefit.id} delay={index * 0.08}>
                <article className={light.triadCard} data-tilt>
                  <div className={light.triadThumb}>
                    <span className={`${light.triadIcon} ${toneFor(index)}`}>
                      <Icon size={26} />
                    </span>
                    {index % 3 === 1 ? (
                      <span className={light.floatTag}>
                        <i /> Included <b>by default</b>
                      </span>
                    ) : null}
                    {index % 3 === 2 ? (
                      <span className={`${light.floatTag} ${light.floatTagAlt}`}>
                        <small>Service agreement</small>
                        <b>Documented</b>
                      </span>
                    ) : null}
                  </div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              </Reveal>
            );
          })}
        </ScrollScene>
      </div>
    </section>
  );
}
