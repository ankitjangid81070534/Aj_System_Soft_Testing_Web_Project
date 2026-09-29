"use client";

import { useEffect } from "react";
import { CONSENT_SAVED_EVENT, readConsent } from "@/lib/consent";

/**
 * Microsoft Clarity (free heatmaps + session recordings). Does nothing until the
 * owner stores `NEXT_PUBLIC_CLARITY_PROJECT_ID`, and loads only after the
 * visitor allows analytics cookies (same consent card as GA).
 */
export function MicrosoftClarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

  useEffect(() => {
    if (!projectId || !/^[a-z0-9]+$/i.test(projectId)) return;

    const load = () => {
      if (!readConsent()?.analytics || document.getElementById("ms-clarity")) return;
      const w = window as unknown as { clarity?: ((...args: unknown[]) => void) & { q?: unknown[] } };
      if (!w.clarity) {
        const queue: unknown[] = [];
        w.clarity = Object.assign((...args: unknown[]) => { queue.push(args); }, { q: queue });
      }
      const script = document.createElement("script");
      script.id = "ms-clarity";
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${projectId}`;
      document.head.appendChild(script);
    };

    load();
    window.addEventListener(CONSENT_SAVED_EVENT, load);
    return () => window.removeEventListener(CONSENT_SAVED_EVENT, load);
  }, [projectId]);

  return null;
}
