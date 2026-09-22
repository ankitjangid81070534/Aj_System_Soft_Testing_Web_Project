"use client";

import { useEffect } from "react";

type Gtag = (...args: unknown[]) => void;

/**
 * Reports which homepage sections visitors actually reach. Every element that
 * already carries `data-home-section` is observed once; when it becomes at
 * least half visible we send a `section_view` GA event with its name and the
 * time taken to reach it. No new markup, no layout impact.
 */
export function SectionEngagement() {
  useEffect(() => {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (!gtag || typeof IntersectionObserver === "undefined") return;

    const start = Date.now();
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = entry.target.getAttribute("data-home-section");
          if (!name || seen.has(name)) continue;
          seen.add(name);
          observer.unobserve(entry.target);
          gtag("event", "section_view", {
            section_name: name,
            seconds_to_reach: Math.round((Date.now() - start) / 1000),
          });
        }
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("[data-home-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
