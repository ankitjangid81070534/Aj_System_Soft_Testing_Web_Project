import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { HomeContent } from "@/lib/data/home";
import { Reveal } from "./Reveal";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";

/**
 * Real proof only: public projects, verified reviews, published team members
 * and articles render when the CMS has them, and are hidden otherwise — the
 * same rule the live homepage follows. Nothing here is invented.
 */
export function DemoProof({ content }: { content: HomeContent }) {
  const { projects, testimonials, team, posts } = content;
  if (projects.length === 0 && testimonials.length === 0 && team.length === 0 && posts.length === 0) {
    return null;
  }

  return (
    <>
      {projects.length > 0 ? (
        <section id="projects" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Reveal>
                <span className={styles.eyebrowPlain}>Projects</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  Delivered <span className={styles.blue}>work</span>
                </h2>
              </Reveal>
            </div>
            <div className={styles.cardGrid}>
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 0.06}>
                  <Link href={`/projects/${project.slug}`} className={styles.darkCard}>
                    <span className={`${styles.cardStripe} ${toneFor(index)}`} aria-hidden />
                    <span className={styles.cardMeta}>
                      {[project.platformType, project.industry].filter(Boolean).join(" · ")}
                    </span>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                    {project.clientName ? <small>{project.clientName}</small> : null}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section id="reviews" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Reveal>
                <span className={styles.eyebrowPlain}>Verified reviews</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  What clients <span className={styles.blue}>say</span>
                </h2>
              </Reveal>
            </div>
            <div className={styles.cardGrid}>
              {testimonials.map((review, index) => (
                <Reveal key={review.id} delay={index * 0.06}>
                  <blockquote className={styles.darkCard}>
                    <span className={styles.stars} aria-label={`${review.rating} out of 5`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} aria-hidden />
                      ))}
                    </span>
                    <p>“{review.quote}”</p>
                    <footer>
                      <strong>{review.authorName}</strong>
                      <small>{[review.authorRole, review.authorCompany].filter(Boolean).join(", ")}</small>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {team.length > 0 ? (
        <section id="team" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Reveal>
                <span className={styles.eyebrowPlain}>Team</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  The people who <span className={styles.blue}>build it</span>
                </h2>
              </Reveal>
            </div>
            <div className={styles.cardGrid}>
              {team.map((member, index) => (
                <Reveal key={member.id} delay={index * 0.06}>
                  <div className={styles.darkCard}>
                    <span className={`${styles.avatar} ${toneFor(index)}`} aria-hidden>
                      {member.name.slice(0, 1)}
                    </span>
                    <h3>{member.name}</h3>
                    <span className={styles.cardMeta}>{member.roleTitle}</span>
                    {member.shortBio ? <p>{member.shortBio}</p> : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section id="blog" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Reveal>
                <span className={styles.eyebrowPlain}>Blog &amp; insights</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  Latest <span className={styles.blue}>articles</span>
                </h2>
              </Reveal>
            </div>
            <div className={styles.cardGrid}>
              {posts.map((post, index) => (
                <Reveal key={post.id} delay={index * 0.06}>
                  <Link href={`/blog/${post.slug}`} className={styles.darkCard}>
                    <span className={`${styles.cardStripe} ${toneFor(index + 3)}`} aria-hidden />
                    {post.category ? <span className={styles.cardMeta}>{post.category}</span> : null}
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <small>
                      Read article <ChevronRight size={14} aria-hidden />
                    </small>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
