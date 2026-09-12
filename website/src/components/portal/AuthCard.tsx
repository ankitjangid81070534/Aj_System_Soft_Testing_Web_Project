import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Boxes, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./portal-ui.module.css";
import { BRAND } from "@/lib/seo/site";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={`${styles.authPage} relative px-4 sm:px-6`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_28%_20%,rgba(22,135,248,0.13),transparent_42%),radial-gradient(circle_at_78%_28%,rgba(31,157,109,0.08),transparent_34%)]"
      />

      <div className={`${styles.authLayout} mx-auto grid w-full max-w-content gap-10 lg:gap-12`}>
        <div className="relative hidden min-h-[34rem] lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-4 py-2 text-sm font-medium text-ink-muted shadow-e1 transition-colors hover:text-ink focus-ring"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to {BRAND.shortName}
          </Link>

          <div className="mt-14 max-w-xl">
            <p className="text-eyebrow font-semibold uppercase text-brand-700">Client workspace</p>
            <h2 className="mt-4 text-display-md font-semibold tracking-[-0.035em] text-ink">
              Your project details, updates and requests in one secure place.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-muted">
              Sign in to follow enquiries, view linked project information, manage your profile and
              share verified feedback after working with our team.
            </p>
          </div>

          <div className="relative mt-10 h-56 max-w-xl [perspective:900px]">
            <div className="absolute inset-x-8 top-0 rotate-[-2deg] rounded-3xl border border-line bg-surface/75 p-5 shadow-e3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-on-brand shadow-e2">
                    <Boxes aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Project workspace</p>
                    <p className="text-xs text-ink-muted">Requirements · Updates · Deliverables</p>
                  </div>
                </div>
                <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
                  Secure
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Requirements", "Captured"],
                  ["Status", "In progress"],
                  ["Support", "Connected"],
                ].map(([label, status]) => (
                  <div key={label} className="rounded-2xl border border-line bg-canvas p-3">
                    <p className="text-[11px] text-ink-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{status}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 w-56 rotate-3 rounded-3xl border border-line bg-surface p-4 shadow-e4">
              <div className="flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
                <p className="text-sm font-semibold text-ink">Verified relationship</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                Reviews unlock only after AJS links a real client engagement.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-success" />
              Supabase-secured sessions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-600" />
              Built around your project
            </span>
          </div>
        </div>

        <div className={styles.authForm}>
          <Link
            href="/"
            className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-ring lg:hidden"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to website
          </Link>
          <div className="overflow-hidden rounded-[2rem] border border-line bg-surface shadow-e4">
            <div className="border-b border-line bg-[linear-gradient(145deg,var(--color-surface),var(--color-brand-50))] px-6 py-7 sm:px-8 dark:bg-none">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-on-brand shadow-e2">
                  AJ
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                    {eyebrow}
                  </p>
                  <p className="text-xs text-ink-muted">{BRAND.primaryName}</p>
                </div>
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em] text-ink">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
            </div>
            <div className="px-6 py-7 sm:px-8 sm:py-8">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
