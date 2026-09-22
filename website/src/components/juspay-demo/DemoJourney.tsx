import styles from "./demo-journey.module.css";

/**
 * "From requirement to payment" — a Juspay-style, pure-CSS 3D story strip:
 * our infrastructure, the client conversation (3D figure on a call), the
 * delivered website UI, and the green paid confirmation. Decorative art only
 * (`aria-hidden`); all meaning lives in the captions, so nothing here invents a
 * client, price or statistic. Pointer tilt comes from the site-wide
 * `TiltEngine` via `data-tilt`; reduced motion settles every scene.
 */
export function DemoJourney({ brandName = "AJS Technology" }: { brandName?: string }) {
  return (
    <section className={styles.section} aria-labelledby="journey-title">
      <div className={styles.head}>
        <span className={styles.eyebrow}>How we work</span>
        <h2 id="journey-title" className={styles.title}>
          From your requirement to a paid, live product
        </h2>
        <p className={styles.lead}>
          {brandName} builds software exactly the way each customer needs it — secure infrastructure,
          a real conversation about your requirement, a website or app shipped to your brand, and a
          clean checkout your customers can trust.
        </p>
      </div>

      <ol className={styles.track}>
        <li className={styles.step}>
          <div className={styles.artWrap}>
            <div className={`${styles.art} ${styles.rack}`} data-tilt aria-hidden="true">
              <i className={styles.chassis} />
              <i className={styles.bay1} />
              <i className={styles.bay2} />
              <i className={styles.bay3} />
              <i className={styles.glow} />
            </div>
          </div>
          <span className={styles.num}>01</span>
          <h3 className={styles.stepTitle}>Secure infrastructure</h3>
          <p className={styles.stepText}>
            Managed hosting, databases and backups run on hardened cloud infrastructure with
            monitoring from day one.
          </p>
        </li>

        <li className={styles.step}>
          <div className={styles.artWrap}>
            <div className={`${styles.art} ${styles.call}`} data-tilt aria-hidden="true">
              <i className={styles.phone} />
              <b className={`${styles.mark} ${styles.callMark}`}>AJ</b>
              <i className={styles.avatar} />
              <i className={styles.bubbleA} />
              <i className={styles.bubbleB} />
              <i className={styles.wave} />
            </div>
          </div>
          <span className={styles.num}>02</span>
          <h3 className={styles.stepTitle}>We talk to the client</h3>
          <p className={styles.stepText}>
            A real consultation call: we listen to your requirement, scope the features and agree the
            plan before a single line of code.
          </p>
        </li>

        <li className={styles.step}>
          <div className={styles.artWrap}>
            <div className={`${styles.art} ${styles.site}`} data-tilt aria-hidden="true">
              <i className={styles.browser} />
              <b className={`${styles.mark} ${styles.siteMark}`}>AJ</b>
              <i className={styles.hero} />
              <i className={styles.siteCta} />
              <i className={styles.cards} />
              <i className={styles.mobile} />
            </div>
          </div>
          <span className={styles.num}>03</span>
          <h3 className={styles.stepTitle}>Your website, your brand</h3>
          <p className={styles.stepText}>
            We design and build the product to your requirement — responsive pages, an admin panel and
            content you control yourself.
          </p>
        </li>

        <li className={styles.step}>
          <div className={styles.artWrap}>
            <div className={`${styles.art} ${styles.paid}`} data-tilt aria-hidden="true">
              <i className={styles.paidPhone} />
              <i className={styles.tick} />
              <i className={styles.receipt} />
              <b className={styles.paidLabel}>PAID</b>
              <i className={styles.ring} />
            </div>
          </div>
          <span className={styles.num}>04</span>
          <h3 className={styles.stepTitle}>Deal done, payment paid</h3>
          <p className={styles.stepText}>
            Milestones are approved, the checkout confirms in green, and your product goes live with
            support and handover documents.
          </p>
        </li>
      </ol>
    </section>
  );
}
