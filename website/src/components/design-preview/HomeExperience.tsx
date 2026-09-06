import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Code2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { TrustStrip } from "@/components/site/TrustStrip";
import { PlatformsShowcase } from "@/components/site/PlatformsShowcase";
import { Industries } from "@/components/site/Industries";
import { TechCapabilities } from "@/components/site/TechCapabilities";
import { WhyUs } from "@/components/site/WhyUs";
import { FeaturedProjects } from "@/components/site/FeaturedProjects";
import { TeamSection } from "@/components/site/TeamSection";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { BlogPreviewSection } from "@/components/site/BlogPreviewSection";
import type { HomeContent } from "@/lib/data/home";
import type { LaunchBenefit } from "@/lib/data/growth";
import { BRAND } from "@/lib/seo/site";
import { OrbitArtwork } from "./OrbitArtwork";
import { DeliveryProcess } from "./DeliveryProcess";
import { ServiceJourney } from "./ServiceJourney";
import { MotionWords } from "@/components/motion/MotionWords";
import { OwnershipOrbit, CosmicBackdrop } from "./SculpturalScenes";
import styles from "./reference.module.css";
import contentStyles from "./home-content.module.css";

/** Shared by the live homepage and preview: public data is fetched by the route.
 * Original section components retain complete descriptions, media and links.
 */
export function HomeExperience({ content, benefits }: { content: HomeContent; benefits: LaunchBenefit[] }) {
  return (
    <div data-home-experience className={contentStyles.content}>
      <section className={styles.hero} data-scroll-scene>
        <OrbitArtwork />
        <div className={styles.heroCopy}>
          <p className={styles.heroBadge}><Sparkles size={13} />{BRAND.primaryName} — available for new projects</p>
          <h1><MotionWords text="Software built around" /><br /><MotionWords text="your requirements." /></h1>
          <p className={styles.heroDescription}>Custom software, web platforms, SaaS, Android &amp; iOS apps and business automation systems — engineered around your workflows, from first mockup to launch.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/request-quote">Start Your Project <ArrowUpRight size={15} /></Link>
            <Link className={styles.secondaryButton} href="/projects">Explore Projects</Link>
          </div>
          <ul className={contentStyles.heroPoints}>{["Requirements-first delivery", "You own the source code", "Support after launch"].map(point => <li key={point}><Check size={12} />{point}</li>)}</ul>
        </div>
        <a className={styles.scrollCue} href="#home-services">Explore what we build <ArrowDown size={13} /></a>
      </section>
      <div className={contentStyles.legacy}><TrustStrip /></div>
      <section id="home-services" className={contentStyles.serviceIntro} data-home-reveal>
        <p className={styles.eyebrow}>Services</p><h2>What we can build for you</h2>
        <p>From a single business tool to a complete platform — every engagement starts with your requirements and ends with working software.</p>
        <Link className={styles.primaryButton} href="/services">Explore all services <ArrowUpRight size={15} /></Link>
      </section>
      <ServiceJourney services={content.services} />
      <div className={contentStyles.legacy}><PlatformsShowcase /><FeaturedProjects projects={content.projects} /></div>
      <DeliveryProcess />
      {benefits.length > 0 && <section className={`${styles.section} ${styles.benefitsSection}`} id="included">
        <Reveal><div className={styles.centerHeading}>
          <p className={styles.eyebrow}>Launch Benefits</p><h2>What&apos;s included with every project</h2>
          <p>Our service goes beyond just writing code. Every custom software project includes these benefits by default.</p>
        </div></Reveal>
        <div className={styles.benefitBento}>
          {benefits.map((benefit, index) => <Reveal key={benefit.id} variant="fan" delay={index * 45} className={`${styles.benefitCell} ${index === 1 ? styles.featuredBenefit : ""}`}>
            <article className={styles.benefitCard} data-tilt="on">
              <span className={styles.benefitIcon}>{index % 2 ? <Layers3 size={22} /> : <ShieldCheck size={22} />}</span>
              <h3>{benefit.title}</h3><p>{benefit.description}</p>
              {index === 1 && <span className={styles.benefitSculpture} aria-hidden="true"><Code2 size={54} strokeWidth={1.2} /></span>}
            </article>
          </Reveal>)}
        </div>
      </section>}
      <section className={styles.ownership} data-scroll-scene data-nav-theme="dark">
        <OwnershipOrbit />
        <Reveal><div className={styles.ownershipCopy}><p className={styles.eyebrow}>One team, every platform</p><h2>You own your software.<br />We help it grow.</h2><p>Source code and documentation handed over with the build. Ongoing care after launch — updates, fixes and improvements.</p><Link className={styles.primaryButton} href="/services">Explore all services <ArrowUpRight size={15} /></Link></div></Reveal>
      </section>
      <div className={contentStyles.legacy}>
        <Industries /><TechCapabilities /><WhyUs />
        <TestimonialsSection testimonials={content.testimonials} /><TeamSection members={content.team} />
        <BlogPreviewSection posts={content.posts} />
      </div>
      <section className={styles.finale} data-scroll-scene data-nav-theme="dark">
        <CosmicBackdrop />
        <div className={styles.finaleCopy} data-home-reveal>
          <p className={styles.eyebrow}>Start a project</p><h2><MotionWords text="Ready to build software around your requirements?" /></h2>
          <p>Tell us what you need — we will propose the right platform, a clear plan and a transparent estimate.</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href="/request-quote">Start Your Project <ArrowUpRight size={15} /></Link><Link className={contentStyles.finaleSecondary} href="/contact">Request a Consultation <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>
    </div>
  );
}
