import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import type { Package } from "@/lib/data/sales";
import { CalendlyButton } from "@/components/integrations/CalendlyButton";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";
import sales from "./demo-sales.module.css";

/**
 * Packages — admin-managed `packages` (migration 0017). Hides itself when the
 * admin has no published rows. Rendered inside the homepage light band; the
 * WhatsApp CTA uses the admin-configured number + pre-filled message.
 */
export function DemoPackages({
  packages,
  whatsappHref,
}: {
  packages: Package[];
  whatsappHref: string | null;
}) {
  if (packages.length === 0) return null;

  return (
    <section className={styles.section} data-home-section="packages">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>Packages</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              Pick a starting point, <span className={styles.blue}>pay by milestone</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>
              Every package includes source-code ownership. Final scope and price are confirmed after a free
              requirement call.
            </p>
          </Reveal>
        </div>
        <div className={sales.packGrid}>
          {packages.map((pack, index) => (
            <Reveal key={pack.id} delay={index * 0.06}>
              <article
                className={`${sales.packCard} ${pack.isHighlighted ? sales.packHighlighted : ""}`}
                data-tilt
              >
                {pack.badgeLabel ? <span className={sales.packBadge}>{pack.badgeLabel}</span> : null}
                <span className={sales.packName}>{pack.name}</span>
                {pack.tagline ? <p className={sales.packTagline}>{pack.tagline}</p> : null}
                {pack.priceLabel ? (
                  <>
                    <span className={sales.packPriceFrom}>Starting at</span>
                    <span className={sales.packPrice}>{pack.priceLabel}</span>
                  </>
                ) : null}
                {pack.priceNote ? <span className={sales.packNote}>{pack.priceNote}</span> : null}
                {pack.priceLabel ? (
                  <div className={sales.packTerms}>
                    <span>Pay by milestone — part advance, rest on delivery stages.</span>
                    <span>GST extra. Final price confirmed after the requirement call.</span>
                  </div>
                ) : null}
                {pack.features.length > 0 ? (
                  <ul className={sales.packFeatures}>
                    {pack.features.map((feature) => (
                      <li key={feature}>
                        <Check size={15} aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {pack.idealFor || pack.deliveryLabel ? (
                  <div className={sales.packMeta}>
                    {pack.idealFor ? <span>Ideal for: {pack.idealFor}</span> : null}
                    {pack.deliveryLabel ? <span>Delivery: {pack.deliveryLabel}</span> : null}
                  </div>
                ) : null}
                <div className={sales.packCta}>
                  <Link className={`${styles.pill} ${styles.pillBlue}`} href={pack.ctaUrl ?? "/request-quote"}>
                    {pack.ctaLabel ?? `Get a ${pack.name} quote`}
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.18}>
          <p style={{ marginTop: 26, textAlign: "center" }}>
            <CalendlyButton className={`${styles.pill} ${styles.pillBlue}`} />
          </p>
        </Reveal>
        {whatsappHref ? (
          <Reveal delay={0.2}>
            <p style={{ marginTop: 26, textAlign: "center" }}>
              <a className={styles.pill} href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden />
                Not sure which package? Ask on WhatsApp
              </a>
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
