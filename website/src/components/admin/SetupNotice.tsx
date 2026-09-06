import Link from "next/link";

/**
 * Shown on admin pages when Supabase is not configured yet — distinct from
 * "session expired" so a fresh clone still reviews the admin UI honestly.
 */
export function SetupNotice({ module }: { module: string }) {
  return (
    <div role="status" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-medium">{module} needs Supabase first.</p>
      <p className="mt-1">
        Follow <code className="text-xs">docs/PHASE-2-SUPABASE-SETUP.md</code> to apply the
        migrations and configure .env.local — then this module goes live.{" "}
        <Link href="/" className="underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
