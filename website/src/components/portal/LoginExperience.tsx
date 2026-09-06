import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/seo/site";
import styles from "./login-experience.module.css";

/** Shared reference-inspired surface; callers retain their real forms/dialog. */
export function LoginSurface({ children, headingId, modal = false }: { children: ReactNode; headingId?: string; modal?: boolean }) {
  const Heading = modal ? "h2" : "h1";
  return (
    <div className={styles.card}>
      <div className={styles.art} aria-hidden="true">
        <Image
          src="/images/client-workspace.webp"
          alt=""
          fill
          sizes="(max-width: 700px) calc(100vw - 62px), (max-width: 1148px) calc(52vw - 64px), 535px"
          priority={!modal}
          loading={modal ? "eager" : undefined}
        />
      </div>
      <div className={styles.panel}>
        <Link href="/" className={`${styles.brand} focus-ring`}>
          <span aria-hidden="true">AJ</span>{BRAND.shortName}
        </Link>
        <div className={styles.heading}>
          <p>CLIENT PORTAL</p>
          <Heading id={headingId}>Welcome back!</Heading>
          <span>Sign in to your secure project workspace.</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoginExperience({ children }: { children: ReactNode }) {
  return (
    <section className={styles.page}>
      <Link href="/" className={`${styles.back} focus-ring`}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to website
      </Link>
      <LoginSurface>{children}</LoginSurface>
    </section>
  );
}
