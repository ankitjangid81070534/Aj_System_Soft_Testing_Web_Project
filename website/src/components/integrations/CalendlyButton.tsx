"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();
const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyApi = { initPopupWidget: (options: { url: string }) => void };

function loadWidget(): Promise<CalendlyApi | null> {
  const existing = (window as unknown as { Calendly?: CalendlyApi }).Calendly;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    if (!document.querySelector("link[data-calendly-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.dataset.calendlyCss = "true";
      document.head.append(link);
    }
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve((window as unknown as { Calendly?: CalendlyApi }).Calendly ?? null);
    script.onerror = () => resolve(null);
    document.head.append(script);
  });
}

/**
 * "Book a consultation call" — opens the owner's Calendly scheduler in its
 * popup widget. The widget script loads only on the first click, and the button
 * renders nothing until `NEXT_PUBLIC_CALENDLY_URL` is configured. It stays a
 * real link, so without JavaScript (or if the widget fails) the scheduler still
 * opens in a new tab.
 */
export function CalendlyButton({
  className,
  label = "Book a consultation call",
}: {
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  if (!CALENDLY_URL) return null;

  return (
    <a
      className={className}
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-busy={busy || undefined}
      onClick={async (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        setBusy(true);
        const api = await loadWidget();
        setBusy(false);
        if (api) api.initPopupWidget({ url: CALENDLY_URL });
        else window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
      }}
    >
      <CalendarClock size={16} aria-hidden />
      {label}
    </a>
  );
}
