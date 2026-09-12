import Link from "next/link";
import { ArrowUpRight, Code2, Layers3 } from "lucide-react";
import type { ServiceTeaser } from "@/lib/data/mappers";
import styles from "./reference.module.css";
import { serviceAccent } from "@/components/ui/service-accent";
import { ScrollJourney } from "./ScrollJourney";

export function ServiceJourney({ services }: { services: ServiceTeaser[] }) {
  if (!services.length) return null;
  const groups = [services.slice(0, 2), services.slice(2, 4), services.slice(4)].filter(group => group.length);
  return (
    <ScrollJourney count={groups.length}>
          {groups.map((group, index) => (
            <div className={styles.journeyScene} key={group[0].id} data-scene-index={index}>
              <span className={styles.sceneWord} aria-hidden="true">{["Build.", "Connect.", "Grow."][index]}</span>
              <div className={styles.sceneInner}>
                <div className={`${styles.productCard} reference-card card-accent-${serviceAccent(group[0].slug)}`} data-tilt="on">
                  <div className={styles.productTop}><span><Code2 size={15} /> AJS Technology</span><i /></div>
                  <div className={styles.productSymbol}><Layers3 size={58} strokeWidth={1} /></div>
                  <h3>{group[0].name}</h3>
                  <p>{group[0].category}</p>
                  <div className={styles.codeLines} aria-hidden="true"><i /><i /><i /><i /></div>
                  <Link href={`/services/${group[0].slug}`}>Learn more <ArrowUpRight size={15} /></Link>
                </div>
                <div className={styles.sceneCopy} data-service-copy>
                  <p className={styles.eyebrow}>What we can build for you</p>
                  {group.map(service => <div key={service.id}>
                    <h2>{service.name}</h2><p>{service.shortDescription}</p>
                    {service.category && <small className={styles.serviceCategory}>{service.category}</small>}
                    <Link href={`/services/${service.slug}`} className={styles.textLink}>Explore service <ArrowUpRight size={15} /></Link>
                  </div>)}
                </div>
              </div>
              <span className={styles.sceneIndex}>0{index + 1} / 0{groups.length}</span>
            </div>
          ))}
    </ScrollJourney>
  );
}
