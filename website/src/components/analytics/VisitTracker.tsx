"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Staff browsers are flagged by the admin shell and never counted. */
export const STAFF_FLAG_KEY = "ajs-staff";

function id(): string {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function stored(storage: Storage, key: string): string {
  let value = storage.getItem(key);
  if (!value) { value = id(); storage.setItem(key, value); }
  return value;
}

/** Sends one beacon per real page view to /api/track. */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (navigator.webdriver || localStorage.getItem(STAFF_FLAG_KEY) === "1") return;
      // Ignore quick reloads of the same page (counted once per 30 minutes per tab).
      const lastKey = `ajs-pv:${pathname}`;
      const last = Number(sessionStorage.getItem(lastKey) ?? 0);
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(lastKey, String(Date.now()));

      const payload = JSON.stringify({
        path: pathname,
        visitorId: stored(localStorage, "ajs-vid"),
        sessionId: stored(sessionStorage, "ajs-sid"),
        referrer: document.referrer || undefined,
      });
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        void fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      // Storage blocked (private mode etc.) — skip silently.
    }
  }, [pathname]);

  return null;
}
