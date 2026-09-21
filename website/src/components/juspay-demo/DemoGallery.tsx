import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronRight, Star } from "lucide-react";
import type { ProjectTeaser } from "@/lib/data/mappers";
import { Reveal } from "./Reveal";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";
import gallery from "./demo-gallery.module.css";

/**
 * High-impact portfolio gallery for the homepage. The first project (featured
 * when one is flagged) takes a large image-led tile; the rest form a mosaic of
 * cover images with the summary revealed on hover / focus. Only real public
 * projects from the CMS are shown — the section hides when there are none.
 */
export function DemoGallery({ projects }: { projects: ProjectTeaser[] }) {
  if (projects.length === 0) return null;

  const ordered = [...projects].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  const [lead, ...rest] = ordered;

  return (
    <section id="projects" className={styles.section} data-home-section="projects">
      <div className={styles.container}>
        <div className={gallery.head}>
          <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
            <Reveal>
              <span className={styles.eyebrowPlain}>Portfolio</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className={styles.h2}>
                Real work, <span className={styles.blue}>delivered</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className={styles.lead}>
                A selection of the platforms, apps and business systems we have shipped for clients — each one built
                around their exact requirements.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <Link href="/projects" className={styles.pill}>
              View all projects <ChevronRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className={gallery.grid}>
          <Reveal className={gallery.leadCell}>
            <GalleryTile project={lead} index={0} lead />
          </Reveal>
          {rest.map((project, index) => (
            <Reveal key={project.id} delay={(index + 1) * 0.06}>
              <GalleryTile project={project} index={index + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryTile({ project, index, lead = false }: { project: ProjectTeaser; index: number; lead?: boolean }) {
  const meta = [project.platformType, project.industry].filter(Boolean).join(" · ");
  return (
    <Link href={`/projects/${project.slug}`} className={`${gallery.tile} ${lead ? gallery.tileLead : ""}`}>
      <span className={gallery.media} aria-hidden>
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt=""
            fill
            sizes={lead ? "(max-width: 1100px) 100vw, 66vw" : "(max-width: 720px) 100vw, 33vw"}
            priority={lead}
          />
        ) : (
          <span className={`${gallery.placeholder} ${toneFor(index)}`}>{project.name.charAt(0)}</span>
        )}
      </span>
      <span className={gallery.shade} aria-hidden />
      {project.isFeatured ? (
        <span className={gallery.badge}>
          <Star size={12} fill="currentColor" aria-hidden /> Featured
        </span>
      ) : null}
      <span className={gallery.body}>
        {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
        <span className={gallery.titleRow}>
          <h3>{project.name}</h3>
          <ArrowUpRight size={20} aria-hidden />
        </span>
        <p>{project.summary}</p>
        {project.clientName ? <small>{project.clientName}</small> : null}
      </span>
    </Link>
  );
}
