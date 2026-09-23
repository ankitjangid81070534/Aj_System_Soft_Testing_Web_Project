import type { TrustedClient } from "@/lib/data/sales";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";

import proof from "./demo-hero-proof.module.css";

/**
 * Instant-trust strip directly under the hero: real counts from the CMS plus a
 * few admin-managed client names, so a first-time visitor sees proof within the
 * first seconds. Nothing is invented — every number is a count of existing
 * records, and each stat/logo row hides itself when there is no data.
 */
export function DemoHeroProof({
  projectCount,
  serviceCount,
  clients,
  copy,
}: {
  projectCount: number;
  serviceCount: number;
  clients: TrustedClient[];
  copy: SiteCopy;
}) {
  const stats = [
    projectCount > 0 ? { value: `${projectCount}`, label: "Projects in our portfolio" } : null,
    serviceCount > 0 ? { value: `${serviceCount}`, label: "Software services offered" } : null,
    clients.length > 0 ? { value: `${clients.length}`, label: "Businesses we work with" } : null,
  ].filter((stat): stat is { value: string; label: string } => stat !== null);
  const logos = clients.slice(0, 5);

  if (stats.length === 0 && logos.length === 0) return null;

  return (
    <section className={proof.wrap} data-home-section="hero-proof">
      <div className={styles.container}>
        {stats.length > 0 ? (
          <Reveal>
            <ul className={proof.stats}>
              {stats.map((stat) => (
                <li key={stat.label}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
        {logos.length > 0 ? (
          <Reveal delay={0.1}>
            <div className={proof.logos}>
              <span className={proof.logosLabel}>{copy.t("home.heroProof.trustedLabel")}</span>
              <ul>
                {logos.map((client) => (
                  <li key={client.id}>{client.name}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
