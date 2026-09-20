"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import type { ServiceTeaser } from "@/lib/data/mappers";
import { Reveal } from "./Reveal";
import styles from "./juspay-demo.module.css";

const HIGHLIGHTS: Record<string, string[]> = {
  "custom-software-development": [
    "Custom modules built from your requirements",
    "Role-based access for staff and managers",
    "Source code ownership and handover",
  ],
  "web-application-development": [
    "Responsive, fast web apps on modern frameworks",
    "Admin panels, dashboards and customer portals",
    "Secure authentication and role management",
  ],
  "saas-development": [
    "Multi-tenant architecture and billing-ready design",
    "Subscription plans, usage limits and admin tooling",
    "Deployment pipeline you can operate yourself",
  ],
  "android-app-development": [
    "Native Android apps for staff and customers",
    "Offline-first data sync where connectivity is poor",
    "Play Store release and update support",
  ],
  "erp-business-software": [
    "Sales, purchase, inventory and accounts in one system",
    "Reports and exports your accountant will actually use",
    "Audit trail of important changes",
  ],
  "hospital-clinic-software": [
    "Patient records, appointments and billing",
    "Fast search across patients by name, phone or ID",
    "Role-based access for doctors, reception and admin",
  ],
};

function StackCard({ service, index, total }: { service: ServiceTeaser; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end 20%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : 0.6]);

  return (
    <motion.article
      ref={ref}
      className={styles.stackCard}
      style={reduce ? undefined : { scale, opacity, top: `calc(140px + ${index * 16}px)` }}
    >
      <span className={styles.stackIndex}>
        <i aria-hidden /> {String(index + 1).padStart(2, "0")} · {service.category}
      </span>
      <h3>{service.name}</h3>
      <p>{service.shortDescription}</p>
      <ul>
        {(HIGHLIGHTS[service.slug] ?? []).map((line) => (
          <li key={line}>
            <Check size={18} aria-hidden /> {line}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

/**
 * "Results that define" — a sticky headline on the left and a stack of
 * service cards on the right that scale and dim as the next one slides over,
 * matching the soft parallax stacking of the reference site.
 */
export function DemoOutcomes({ services }: { services: ServiceTeaser[] }) {
  return (
    <section id="outcomes" className={styles.section}>
      <div className={`${styles.container} ${styles.outcomes}`}>
        <div className={styles.outcomesSticky}>
          <Reveal>
            <span className={styles.eyebrowPlain}>what we build</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className={styles.h2}>
              Results that define <span className={styles.blue}>AJS</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={styles.lead}>
              Every engagement starts with written requirements, continues with working software you can
              review, and ends with a deployment your team owns outright.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link href="/services" className={styles.pill}>
              Explore all services <ChevronRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>
        <div className={styles.stack}>
          {services.map((service, index) => (
            <StackCard key={service.id} service={service} index={index} total={services.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
