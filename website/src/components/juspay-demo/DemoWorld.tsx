import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { ClientMap3D } from "./ClientMap3D";
import styles from "./juspay-demo.module.css";
import light from "./demo-light.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";

export function DemoWorld({
  serviceCount,
  ctaHref,
  ctaLabel,
  copy,
}: {
  serviceCount: number;
  ctaHref: string;
  ctaLabel: string;
  copy: SiteCopy;
}) {
  return (
    <section id="coverage" className={light.section}>
      <div className={`${styles.container} ${light.world}`}>
        <div>
          <Reveal>
            <h2 className={light.h2}>
              {copy.t("home.world.title")} <span className={styles.blue}>{copy.t("home.world.titleAccent")}</span>.
              <br />
              {copy.t("home.world.titleLine2")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={light.lead}>{copy.t("home.world.lead")}</p>
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
          <ClientMap3D />
        </Reveal>
      </div>
    </section>
  );
}
