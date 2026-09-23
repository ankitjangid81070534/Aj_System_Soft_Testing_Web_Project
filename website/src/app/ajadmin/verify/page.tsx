import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { TwoFactorChallenge } from "@/app/ajadmin/verify/challenge-form";
import { getCurrentUser } from "@/lib/auth/session";
import { roleAtLeast } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { getTwoFactorStatus, hasTwoFactorSession } from "@/lib/security/two-factor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Two-factor verification" },
  robots: { index: false, follow: false },
};

export default async function AdminVerifyPage() {
  if (!isSupabaseConfigured) redirect("/ajadmin/login");
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user.role, "editor")) redirect("/ajadmin/login");

  const status = await getTwoFactorStatus(user.id);
  if (!status.enrolled) redirect("/ajadmin");
  if (await hasTwoFactorSession(user.id)) redirect("/ajadmin");

  return (
    <section className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-e3">
      <div className="text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-on-brand">
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">Two-factor verification</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Enter the 6-digit code from your authenticator app for {user.email}.
        </p>
      </div>
      <div className="mt-6 border-t border-line/60 pt-6">
        <TwoFactorChallenge />
      </div>
    </section>
  );
}
