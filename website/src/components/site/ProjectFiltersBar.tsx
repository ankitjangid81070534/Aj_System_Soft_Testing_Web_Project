import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { buildFilterHref, type ProjectFilters } from "@/lib/data/projects";

function ChipGroup({
  label,
  values,
  active,
  current,
  paramKey,
}: {
  label: string;
  values: string[];
  active?: string;
  current: ProjectFilters;
  paramKey: keyof ProjectFilters;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-ink">{label}:</span>
      {values.map((value) => {
        const isActive = active?.toLowerCase() === value.toLowerCase();
        return (
          <Link
            key={value}
            href={buildFilterHref(current, paramKey, value)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 ease-soft focus-ring",
              isActive
                ? "border-brand-600 bg-brand-600 text-on-brand shadow-e2"
                : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
            )}
          >
            {value}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Server-rendered filter bar: chips are plain links, so filtering works
 * without JavaScript and every combination is a shareable URL.
 */
export function ProjectFiltersBar({
  facets,
  current,
  resultCount,
}: {
  facets: { platforms: string[]; industries: string[] };
  current: ProjectFilters;
  resultCount: number;
}) {
  const hasAnyFacet = facets.platforms.length > 0 || facets.industries.length > 0;
  const hasActiveFilter = Boolean(current.platform || current.industry);
  if (!hasAnyFacet) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-e1 sm:p-5">
      {facets.platforms.length > 0 ? (
        <ChipGroup
          label="Platform"
          values={facets.platforms}
          active={current.platform}
          current={current}
          paramKey="platform"
        />
      ) : null}
      {facets.industries.length > 0 ? (
        <ChipGroup
          label="Industry"
          values={facets.industries}
          active={current.industry}
          current={current}
          paramKey="industry"
        />
      ) : null}
      <p className="text-xs text-ink-muted" role="status">
        {resultCount} {resultCount === 1 ? "project" : "projects"}
        {hasActiveFilter ? (
          <>
            {" · "}
            <Link href="/projects" className="font-medium text-brand-600 hover:text-brand-700">
              Clear filters
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
