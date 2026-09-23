"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[projects/[slug]] render failed", error);
  }, [error]);

  return (
    <main className="flex min-h-[70svh] flex-col items-center justify-center bg-[#080808] px-4 py-20 text-center text-white">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-white/50">Case study</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        We couldn&apos;t load this case study
      </h1>
      <p className="mt-3 max-w-md text-white/70">
        Something went wrong while loading this project. Please try again, or browse our other work.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-white/40">Reference: {error.digest}</p> : null}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#080808] transition-colors hover:bg-white/85"
        >
          Try again
        </button>
        <Link
          href="/projects"
          className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Back to projects
        </Link>
      </div>
    </main>
  );
}
