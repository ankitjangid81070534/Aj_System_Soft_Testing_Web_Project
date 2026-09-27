import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AdminResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Reset password" },
  robots: { index: false, follow: false },
};

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-10">
      <Link
        href="/ajadmin/login"
        className="mb-6 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-ring"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to sign in</span>
      </Link>
      <section className="w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-e3 sm:p-9">
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-on-brand shadow-e2">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">Forgot admin password</h1>
          <p className="mt-1 text-xs text-ink-muted">
            We&apos;ll email a one-time code to your staff account.
          </p>
        </div>
        <div className="mt-6 border-t border-line/60 pt-6">
          <AdminResetForm />
        </div>
      </section>
    </div>
  );
}
