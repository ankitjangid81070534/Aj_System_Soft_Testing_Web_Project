import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { CaseStudy } from "@/lib/data/sales";
import { Reveal } from "./Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";

import sales from "./demo-sales.module.css";

/**
 * Case studies — admin-managed `case_studies` (migration 0017): challenge,
 * solution, measurable results. Hides itself when the admin has no published
 * rows. Dark Juspay-style band.
 */
export function DemoCaseStudies({ studies, copy }: { studies: CaseStudy[]; copy: SiteCopy }) {
  if (studies.length === 0) return null;

  return (
    <section className={styles.section} data-home-section="case-studies">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <span className={styles.eyebrowPlain}>{copy.t("home.caseStudies.eyebrow")}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              {copy.t("home.caseStudies.title")}{" "}
              <span className={styles.blue}>{copy.t("home.caseStudies.titleAccent")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={styles.lead}>{copy.t("home.caseStudies.lead")}</p>
          </Reveal>
        </div>
        <ScrollScene variant="rise" className={sales.caseGrid}>
          {studies.map((study, index) => (
            <Reveal key={study.id} delay={index * 0.06}>
              <article className={sales.caseCard} data-tilt>
                {study.industry || study.platform ? (
                  <div className={sales.caseMeta}>
                    {study.industry ? <span>{study.industry}</span> : null}
                    {study.platform ? <span>{study.platform}</span> : null}
                  </div>
                ) : null}
                <h3>{study.title}</h3>
                {study.summary ? <p className={sales.caseSummary}>{study.summary}</p> : null}
                {study.metrics.length > 0 ? (
                  <div className={sales.metrics}>
                    {study.metrics.slice(0, 3).map((metric) => (
                      <div key={`${metric.label}-${metric.value}`}>
                        <span className={sales.metricValue}>{metric.value}</span>
                        <span className={sales.metricLabel}>{metric.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {study.results.length > 0 ? (
                  <ul className={sales.results}>
                    {study.results.slice(0, 4).map((result) => (
                      <li key={result}>
                        <Check size={15} aria-hidden />
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className={sales.caseFoot}>
                  <span>
                    {study.clientName ? `${study.clientName}` : ""}
                    {study.clientName && study.durationLabel ? " · " : ""}
                    {study.durationLabel ?? ""}
                  </span>
                  {study.ctaUrl ? (
                    <Link className={styles.pill} href={study.ctaUrl}>
                      {study.ctaLabel ?? "Read more"}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </ScrollScene>
      </div>
    </section>
  );
}
