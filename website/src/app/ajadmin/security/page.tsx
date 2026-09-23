import type { Metadata } from "next";
import { Lock, ShieldCheck } from "lucide-react";
import { TwoFactorPanel } from "@/components/admin/TwoFactorPanel";
import { requireStaff } from "@/lib/auth/session";
import { adminUrlSegment } from "@/lib/security/admin-gate";
import { isEncryptionConfigured } from "@/lib/security/crypto";
import { getTwoFactorStatus } from "@/lib/security/two-factor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Security & 2FA",
  robots: { index: false, follow: false },
};

export default async function AdminSecurityPage() {
  const user = await requireStaff();
  const status = await getTwoFactorStatus(user.id);
  const hiddenEntrance = adminUrlSegment();
  const encryption = isEncryptionConfigured();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
          <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-600" />
          Security &amp; 2FA
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Account protection for {user.email}. Every admin action is also recorded in the audit log.
        </p>
      </header>

      <TwoFactorPanel
        enrolled={status.enrolled}
        pending={status.pending}
        setupHint={status.setupHint}
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-e1">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-on-brand">
            <Lock aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Hidden admin entrance</p>
            <p className="text-xs text-ink-muted">
              The admin area answers 404 unless the visitor arrived through the secret entrance URL.
            </p>
          </div>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Secret entrance</dt>
            <dd className="text-ink">
              {hiddenEntrance ? (
                <code className="rounded bg-canvas-raised px-1.5 py-0.5 text-xs">
                  /{hiddenEntrance}
                </code>
              ) : (
                "Not configured — /ajadmin is publicly reachable. Set ADMIN_URL_SEGMENT to enable it."
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Column encryption</dt>
            <dd className="text-ink">
              {encryption
                ? "AES-256-GCM active (DATA_ENCRYPTION_KEY configured)"
                : "Not configured — set DATA_ENCRYPTION_KEY"}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-ink-muted">
          Both values are server-only secrets. Rotating DATA_ENCRYPTION_KEY invalidates existing
          2FA enrolments, so re-enrol afterwards.
        </p>
      </section>
    </div>
  );
}
