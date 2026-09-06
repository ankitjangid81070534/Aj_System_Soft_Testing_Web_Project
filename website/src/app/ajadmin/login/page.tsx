import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/app/ajadmin/login/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { safeAdminPath } from "@/lib/validation/auth";
import { BRAND } from "@/lib/seo/site";
import { roleAtLeast } from "@/lib/auth/permissions";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Secure Staff Login" },
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeAdminPath(next);

  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    if (user) redirect(roleAtLeast(user.role, "editor") ? nextPath : "/account");
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-10">
      {/* Return to website link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-ring rounded-md px-2.5 py-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to public website</span>
      </Link>

      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface p-7 shadow-e3 sm:p-9">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-base font-bold text-on-brand shadow-e2">
            AJS
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">Staff Administration</h1>
          <p className="mt-1 text-xs text-ink-muted">
            {BRAND.primaryName} · Internal CMS & Operations
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-6 border-t border-line/60 pt-6">
          {isSupabaseConfigured ? (
            <LoginForm nextPath={nextPath} />
          ) : (
            <p
              role="status"
              className="rounded-xl border border-warning/20 bg-warning-soft px-3.5 py-3 text-xs text-warning"
            >
              Supabase credentials not configured in environment variables.
            </p>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted border-t border-line/60 pt-4">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>Encrypted Session · Access attempts logged & audited</span>
        </div>
      </section>
    </div>
  );
}
