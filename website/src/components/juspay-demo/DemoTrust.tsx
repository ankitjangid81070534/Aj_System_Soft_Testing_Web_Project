import type { TrustedClient } from "@/lib/data/sales";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";

import sales from "./demo-sales.module.css";

/**
 * Trust strip — admin-managed `trusted_clients` (migration 0017). Hides itself
 * when the admin has no active rows. Rendered inside the homepage light band.
 */
export function DemoTrust({ clients, copy }: { clients: TrustedClient[]; copy: SiteCopy }) {
  if (clients.length === 0) return null;

  return (
    <section className={styles.section} data-home-section="trusted-clients">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>{copy.t("home.trust.eyebrow")}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              {copy.t("home.trust.title")} <span className={styles.blue}>{copy.t("home.trust.titleAccent")}</span>
            </h2>
          </Reveal>
        </div>
        <div className={sales.trustRow}>
          {clients.map((client, index) => {
            const body = (
              <>
                <span className={sales.trustName}>{client.name}</span>
                {client.industry ? <span className={sales.trustIndustry}>{client.industry}</span> : null}
              </>
            );
            return (
              <Reveal key={client.id} delay={index * 0.04}>
                {client.websiteUrl ? (
                  <a className={sales.trustCard} href={client.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {body}
                  </a>
                ) : (
                  <div className={sales.trustCard}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
