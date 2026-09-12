import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/** Honest setup state; never render a pretend authenticated dashboard. */
export function SetupNotice({ module }: { module: string }) {
  return (
    <div role="status" className="w-full max-w-xl rounded-2xl border border-line bg-surface p-5 text-sm text-ink shadow-e2 sm:p-7">
      <ShieldCheck aria-hidden="true" className="mb-4 h-7 w-7 text-brand-600" />
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin workspace</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">{module} needs Supabase first.</h1>
      <p className="mt-3 leading-relaxed text-ink-soft">
        Connect the existing project through your secure environment settings. Confirm its
        migration history before making changes; this screen does not grant admin access.
      </p>
      <p className="mt-3 break-words text-xs leading-relaxed text-ink-muted">
        Setup guide: <code>docs/PHASE-2-SUPABASE-SETUP.md</code>
      </p>
      <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line px-4 font-medium hover:bg-canvas focus-ring">
        Back to site
      </Link>
    </div>
  );
}
