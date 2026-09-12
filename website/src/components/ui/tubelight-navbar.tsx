"use client";

import { Fragment, useId, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavigationActive } from "@/lib/bottom-navigation";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: readonly NavItem[];
  className?: string;
  /** Embed in an existing navigation landmark rather than adding a fixed dock. */
  embedded?: boolean;
  /** Undefined follows the current route; null means no active item. */
  activeUrl?: string | null;
  /** Preserve existing controls (e.g. a More dialog trigger) and their semantics. */
  renderItem?: (item: NavItem, isActive: boolean, lamp: ReactNode) => ReactNode;
}

/** Tubelight navigation, adapted to the site's white palette and desktop breakpoint. */
export function NavBar({ items, className, embedded = false, activeUrl, renderItem }: NavBarProps) {
  const pathname = usePathname();
  const layoutId = useId();
  const reducedMotion = useReducedMotion();
  const selectedUrl = activeUrl === undefined
    ? items.find(item => isNavigationActive(pathname, item.url))?.url
    : activeUrl;

  return (
    <LayoutGroup id={layoutId}>
      <div className={cn(
        !embedded && "fixed top-6 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-neutral-200 bg-white/95 p-2 shadow-lg backdrop-blur-lg lg:flex",
        className,
      )}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = selectedUrl === item.url;
          const lamp = isActive ? (
            <motion.div
              aria-hidden="true"
              data-tubelight
              layoutId={reducedMotion ? undefined : "lamp"}
              className="pointer-events-none absolute inset-0 hidden rounded-full bg-orange-400/5 lg:block"
              initial={false}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-orange-400">
                <div className="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-orange-400/20 blur-md" />
                <div className="absolute -top-1 h-6 w-8 rounded-full bg-orange-400/20 blur-md" />
                <div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-orange-400/20 blur-sm" />
              </div>
            </motion.div>
          ) : null;

          return (
            <Fragment key={item.url}>
              {renderItem ? renderItem(item, isActive, lamp) : (
                <Link href={item.url} aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700",
                    isActive && "bg-orange-50 text-amber-900",
                  )}>
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{item.name}</span>
                  {lamp}
                </Link>
              )}
            </Fragment>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
