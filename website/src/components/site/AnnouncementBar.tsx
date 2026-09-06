"use client";

import { useState, useEffect } from "react";
import type { Announcement } from "@/lib/data/growth";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

import { IconButton } from "@/components/ui/IconButton";

export function AnnouncementBar({ announcement }: { announcement: Announcement }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    
    // Check if dismissed
    const storageKey = `ajs_announcement_dismissed_${announcement.id}`;
    if (announcement.isDismissible && sessionStorage.getItem(storageKey)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [announcement]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (announcement.isDismissible) {
      sessionStorage.setItem(`ajs_announcement_dismissed_${announcement.id}`, "1");
    }
  };

  const cta = announcement.ctaUrl ? (
    <Link
      href={announcement.ctaUrl}
      className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
    >
      {announcement.ctaLabel || "Learn more"}
      <ArrowRight className="h-3 w-3" />
    </Link>
  ) : null;

  return (
    <div className="relative z-50 flex items-center justify-center bg-brand-50 px-4 py-2.5 text-center text-sm text-brand-900 shadow-sm dark:bg-brand-950 dark:text-brand-200">
      <div className="flex items-center gap-2">
        {announcement.badgeLabel && (
          <span className="rounded-full bg-brand-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-800 dark:bg-brand-800 dark:text-brand-100">
            {announcement.badgeLabel}
          </span>
        )}
        <p className="flex flex-wrap items-center justify-center gap-x-1.5 font-medium">
          <span>{announcement.title}</span>
          {cta && <span className="hidden sm:inline">-</span>}
          {cta}
        </p>
      </div>

      {announcement.isDismissible && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <IconButton
            aria-label="Dismiss announcement"
            onClick={handleDismiss}
            size="sm"
            className="text-brand-700 hover:bg-brand-200/50 hover:text-brand-900 dark:text-brand-400 dark:hover:bg-brand-800/50 dark:hover:text-brand-200"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
