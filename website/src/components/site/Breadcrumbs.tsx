import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type Crumb = { name: string; href: string };

/**
 * Visible breadcrumb trail (pairs with breadcrumbJsonLd for the machine
 * version). The current page is the last item, not a link.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="rounded-sm transition-colors hover:text-ink focus-ring"
                  >
                    {item.name}
                  </Link>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-line-strong" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
