import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { StatusPill } from "@/components/ui/Badge";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/**
 * Portfolio teaser card. Shows real fields only — anything missing is simply
 * not rendered (no placeholder facts).
 */
export function ProjectCard({
  name,
  href,
  coverUrl,
  clientName,
  industry,
  platformType,
  summary,
  status,
  isFeatured = false,
  priority = false,
  className,
}: {
  name: string;
  href?: string;
  coverUrl?: string | null;
  clientName?: string | null;
  industry?: string | null;
  platformType?: string | null;
  summary?: string | null;
  status?: string;
  isFeatured?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div className="relative z-10 m-2 aspect-[16/10] overflow-hidden rounded-[1rem] bg-canvas-raised ring-1 ring-line">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${name} — project preview`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
          />
        ) : (
          <div className="bg-dots flex h-full items-center justify-center bg-gradient-to-br from-brand-50 via-canvas to-accent-50">
            <span
              aria-hidden="true"
              className="text-gradient text-4xl font-bold tracking-tight"
            >
              {initials(name)}
            </span>
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {isFeatured ? (
            <span className="glass rounded-full px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
              Featured
            </span>
          ) : null}
          {status ? <StatusPill status={status} className="shadow-e1" /> : null}
        </div>
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-1.5 px-5 pb-5 pt-3">
        <h3 className="font-semibold tracking-tight text-ink transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">
          {name}
        </h3>
        {summary ? <p className="line-clamp-2 text-sm text-ink-muted">{summary}</p> : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-muted">
          {clientName ? <span>{clientName}</span> : null}
          {industry ? <span aria-hidden="true">·</span> : null}
          {industry ? <span>{industry}</span> : null}
          {platformType ? <span aria-hidden="true">·</span> : null}
          {platformType ? <span>{platformType}</span> : null}
        </div>
      </div>
    </>
  );

  const classes = cn(
    "group card-3d flex h-full flex-col overflow-hidden rounded-[1.375rem] focus-ring",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <article className={classes}>{body}</article>;
}
