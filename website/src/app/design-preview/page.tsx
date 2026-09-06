import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Code2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/ui/MarketingHeader";
import { Footer } from "@/components/ui/Footer";
import { Reveal } from "@/components/site/Reveal";
import { FeaturedProjects } from "@/components/site/FeaturedProjects";
import { TeamSection } from "@/components/site/TeamSection";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { getHomeContent } from "@/lib/data/home";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublicNavigation } from "@/lib/data/navigation";
import { getLaunchBenefits } from "@/lib/data/growth";
import { BRAND } from "@/lib/seo/site";
import { OrbitArtwork } from "@/components/design-preview/OrbitArtwork";
import { DeliveryProcess } from "@/components/design-preview/DeliveryProcess";
import { ServiceJourney } from "@/components/design-preview/ServiceJourney";
import styles from "@/components/design-preview/reference.module.css";

export const metadata: Metadata = {
  title: "Design preview | AJS Technology",
  robots: { index: false, follow: false },
};

/** Isolated proposal: the existing homepage, business logic and routes stay untouched. */
export default async function DesignPreviewPage() {
  const [content, settings, navigation, benefits] = await Promise.all([
    getHomeContent(), getSiteSettings(), getPublicNavigation(), getLaunchBenefits(),
  ]);
  return (
    <div className={styles.page} data-design-preview>
      <a href="#preview-content" className={styles.skipLink}>Skip to content</a>
      <div className={styles.headerFrame}>
        <MarketingHeader navLinks={navigation.header} brandName={settings?.brandName} brandShortName={settings?.brandShortName} ctaLabel={settings?.globalCtaLabel} ctaHref={settings?.globalCtaHref} />
      </div>
      <main id="preview-content">
        <section className={styles.hero}>
          <OrbitArtwork />
          <div className={styles.heroCopy}>
            <p className={styles.heroBadge}><Sparkles size={13} /> Software built around you</p>
            <h1>Software built around<br />your requirements.</h1>
            <p className={styles.heroDescription}>Custom software, web platforms, SaaS, Android &amp; iOS apps and business automation systems — engineered around your workflows, from first mockup to launch.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/request-quote">Start Your Project <ArrowUpRight size={15} /></Link>
              <Link className={styles.secondaryButton} href="/projects">Explore Projects</Link>
            </div>
          </div>
          <a className={styles.scrollCue} href="#capabilities">Explore what we build <ArrowDown size={13} /></a>
        </section>
        <ServiceJourney services={content.services} />
        <DeliveryProcess />
        <section className={`${styles.section} ${styles.benefitsSection}`} id="included">
          <Reveal><div className={styles.centerHeading}>
            <p className={styles.eyebrow}>Launch benefits</p>
            <h2>More than software.<br />A complete partnership.</h2>
            <p>Our service goes beyond just writing code. Every custom software project includes these benefits by default.</p>
            <Link className={styles.primaryButton} href="/request-quote">Start Your Project <ArrowUpRight size={15} /></Link>
          </div></Reveal>
          <div className={styles.benefitBento}>
            {benefits.map((benefit, index) => <Reveal key={benefit.id} delay={index * 45} className={`${styles.benefitCell} ${index === 1 ? styles.featuredBenefit : ""}`}>
              <article className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{index % 2 ? <Layers3 size={22} /> : <ShieldCheck size={22} />}</span>
                <h3>{benefit.title}</h3><p>{benefit.description}</p>
                {index === 1 && <span className={styles.benefitSculpture} aria-hidden="true"><Code2 size={54} strokeWidth={1.2} /></span>}
              </article>
            </Reveal>)}
          </div>
        </section>
        <section className={styles.ownership}>
          <div className={styles.floatingCards} aria-hidden="true">
            <div><Code2 /><span>Requirements-first</span><div className={styles.codeLines}><i /><i /><i /></div></div>
            <div><Layers3 /><span>Web · SaaS · Apps</span><div className={styles.miniBars}><i /><i /><i /><i /><i /></div></div>
            <div><ShieldCheck /><span>You own the source code</span><div className={styles.codeLines}><i /><i /><i /></div></div>
          </div>
          <Reveal><div className={styles.ownershipCopy}><p className={styles.eyebrow}>One team, every platform</p><h2>You own your software.<br />We help it grow.</h2><p>Source code and documentation handed over with the build. Ongoing care after launch — updates, fixes and improvements.</p><Link className={styles.primaryButton} href="/services">Explore all services <ArrowUpRight size={15} /></Link></div></Reveal>
        </section>
        <section className={`${styles.section} ${styles.detailsSection}`}>
          <Reveal><div className={styles.centerHeading}><p className={styles.eyebrow}>Built around your business</p><h2>The right technology.<br />For the way you work.</h2></div></Reveal>
          <div className={styles.detailColumns}>
            <div><h3>Software for your industry</h3><ul>{["Healthcare & clinics", "Pharmacy & medical stores", "Retail & shops", "Hotels & hospitality", "Manufacturing", "Logistics & distribution", "Education & institutes", "Professional services"].map(item => <li key={item}><Check size={14} />{item}</li>)}</ul></div>
            <div><h3>A modern, maintainable stack</h3><div className={styles.technologyTags}>{["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Supabase", "Kotlin", "Swift", "Flutter", ".NET", "Electron", "Tailwind CSS", "GraphQL", "CI/CD"].map(item => <span key={item}>{item}</span>)}</div><p>We choose proven technology per project — here is what we commonly work with.</p></div>
            <div><h3>Why AJS Technology</h3><ul>{["Requirements lead, code follows", "End-to-end delivery", "Built to be maintained", "Security & ownership"].map(item => <li key={item}><Check size={14} />{item}</li>)}</ul><p>A focused development partner that treats your requirements as the specification.</p></div>
          </div>
        </section>
        <div className={styles.existingContent}>
          <FeaturedProjects projects={content.projects} />
          <TestimonialsSection testimonials={content.testimonials} />
          <TeamSection members={content.team} />
        </div>
        {content.posts.length > 0 && <section className={`${styles.section} ${styles.insights}`}>
          <Reveal><div className={styles.insightsHeader}><div><p className={styles.eyebrow}>Insights &amp; articles</p><h2>Engineering &amp;<br />architecture notes.</h2></div><Link href="/blog" className={styles.secondaryButton}>View all articles <ArrowUpRight size={15} /></Link></div></Reveal>
          <div className={styles.articleGrid}>{content.posts.map(post => <Link key={post.id} href={`/blog/${post.slug}`} className={styles.articleCard}><small>{post.category}</small><h3>{post.title}</h3><p>{post.excerpt}</p><span>{post.readingMinutes ? `${post.readingMinutes} min read · ` : ""}Read note <ArrowUpRight size={14} /></span></Link>)}</div>
        </section>}
        <section className={styles.finale}>
          <OrbitArtwork finale />
          <div className={styles.finaleCopy}><p className={styles.eyebrow}>Start a project</p><h2>Build something great<br />with {settings?.brandShortName || BRAND.shortName}.</h2><p>Tell us what you need — we will propose the right platform, a clear plan and a transparent estimate.</p><Link className={styles.primaryButton} href="/contact">Request a Consultation <ArrowUpRight size={15} /></Link></div>
        </section>
      </main>
      <div className={styles.footerFrame}><Footer settings={settings} managedLinks={navigation.footer} /></div>
    </div>
  );
}
