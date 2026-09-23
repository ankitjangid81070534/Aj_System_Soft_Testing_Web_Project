import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, Clock, Globe, Mail, MessageSquareReply, Star } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import type { HomeContent } from "@/lib/data/home";
import { Reveal } from "./Reveal";
import { toneFor } from "./tones";
import styles from "./juspay-demo.module.css";
import type { SiteCopy } from "@/lib/data/site-copy";


/**
 * Real proof only: verified reviews, published team members and articles
 * (projects live in `DemoGallery`) render when the CMS has them, and are hidden otherwise — the
 * same rule the live homepage follows. Nothing here is invented.
 */
export function DemoProof({ content, copy }: { content: HomeContent; copy: SiteCopy }) {
  const { testimonials, team, posts } = content;
  if (testimonials.length === 0 && team.length === 0 && posts.length === 0) {
    return null;
  }

  return (
    <>
      {testimonials.length > 0 ? (
        <section id="reviews" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Reveal>
                <span className={styles.eyebrowPlain}>{copy.t("home.reviews.eyebrow")}</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  {copy.t("home.reviews.title")} <span className={styles.blue}>{copy.t("home.reviews.titleAccent")}</span>
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
                    {review.projectName ? <span className={styles.cardMeta}>{review.projectName}</span> : null}
                    {review.title ? <h3>{review.title}</h3> : null}
                    <p>“{review.quote}”</p>
                    {review.adminResponse ? (
                      <div className={styles.cardResponse}>
                        <span>
                          <MessageSquareReply size={14} aria-hidden /> Response from AJS Technology
                        </span>
                        <p>{review.adminResponse}</p>
                      </div>
                    ) : null}
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
                <span className={styles.eyebrowPlain}>{copy.t("home.team.eyebrow")}</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  {copy.t("home.team.title")} <span className={styles.blue}>{copy.t("home.team.titleAccent")}</span>
                </h2>
              </Reveal>
            </div>
            <div className={styles.cardGrid}>
              {team.map((member, index) => (
                <Reveal key={member.id} delay={index * 0.06}>
                  <div className={styles.darkCard}>
                    {member.photoUrl ? (
                      <span className={`${styles.avatar} ${styles.avatarPhoto}`}>
                        <Image src={member.photoUrl} alt={member.name} width={56} height={56} />
                      </span>
                    ) : (
                      <span className={`${styles.avatar} ${toneFor(index)}`} aria-hidden>
                        {member.name.slice(0, 1)}
                      </span>
                    )}
                    <h3>{member.name}</h3>
                    <span className={styles.cardMeta}>{member.roleTitle}</span>
                    {member.shortBio ? <p>{member.shortBio}</p> : null}
                    {member.skills.length > 0 ? (
                      <ul className={styles.skillList} aria-label={`${member.name} skills`}>
                        {member.skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    ) : null}
                    {member.linkedinUrl || member.githubUrl || member.portfolioUrl || member.email ? (
                      <div className={styles.cardLinks}>
                        {member.linkedinUrl ? (
                          <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`}>
                            <LinkedInIcon />
                          </a>
                        ) : null}
                        {member.githubUrl ? (
                          <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`}>
                            <GitHubIcon />
                          </a>
                        ) : null}
                        {member.portfolioUrl ? (
                          <a href={member.portfolioUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} portfolio`}>
                            <Globe size={16} aria-hidden />
                          </a>
                        ) : null}
                        {member.email ? (
                          <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}>
                            <Mail size={16} aria-hidden />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
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
                <span className={styles.eyebrowPlain}>{copy.t("home.blog.eyebrow")}</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className={styles.h2}>
                  {copy.t("home.blog.title")} <span className={styles.blue}>{copy.t("home.blog.titleAccent")}</span>
                </h2>
              </Reveal>
            </div>
            <div className={styles.cardGrid}>
              {posts.map((post, index) => (
                <Reveal key={post.id} delay={index * 0.06}>
                  <Link href={`/blog/${post.slug}`} className={styles.darkCard}>
                    <span className={`${styles.cardStripe} ${toneFor(index + 3)}`} aria-hidden />
                    {post.coverUrl ? (
                      <span className={styles.cardCover}>
                        <Image src={post.coverUrl} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" />
                      </span>
                    ) : null}
                    {post.category ? <span className={styles.cardMeta}>{post.category}</span> : null}
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    {post.readingMinutes || post.publishedAt ? (
                      <span className={styles.postMeta}>
                        {post.publishedAt ? (
                          <time dateTime={post.publishedAt}>
                            <Calendar size={12} aria-hidden />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </time>
                        ) : null}
                        {post.readingMinutes ? (
                          <span>
                            <Clock size={12} aria-hidden />
                            {post.readingMinutes} min read
                          </span>
                        ) : null}
                      </span>
                    ) : null}
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
