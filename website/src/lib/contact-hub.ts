import { DEFAULT_CTA_HREF, DEFAULT_CTA_LABEL, textOrDefault } from "@/lib/data/cta";
import type { SiteSettings } from "@/lib/data/settings";

export type ContactHubAction = {
  kind: "whatsapp" | "phone" | "email" | "project" | "quote" | "contact";
  label: string;
  href: string;
};
type ContactSettings = Pick<SiteSettings, "phone" | "whatsapp" | "contactEmail" | "globalCtaLabel" | "globalCtaHref"> &
  Partial<Pick<SiteSettings, "whatsappMessage">>;

/** Scoped validation for legacy settings; does not change global CTA behavior. */
export function safeContactDestination(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href || /[\s\\\u0000-\u001f\u007f]/.test(href)) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function phoneNumber(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input || !/^\+?[\d ().-]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? `${input.startsWith("+") ? "+" : ""}${digits}` : null;
}

export function getContactHubActions(settings: ContactSettings | null): ContactHubAction[] {
  const actions: ContactHubAction[] = [];
  const whatsapp = phoneNumber(settings?.whatsapp);
  const phone = phoneNumber(settings?.phone);
  const email = settings?.contactEmail?.trim();
  if (whatsapp) {
    const message = settings?.whatsappMessage?.trim();
    const query = message ? `?text=${encodeURIComponent(message)}` : "";
    actions.push({ kind: "whatsapp", label: "WhatsApp", href: `https://wa.me/${whatsapp.replace(/^\+/, "")}${query}` });
  }
  if (phone) actions.push({ kind: "phone", label: "Call", href: `tel:${phone}` });
  if (email && /^[a-zA-Z0-9.!#$%&'*+/=^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(email)) {
    actions.push({ kind: "email", label: "Email", href: `mailto:${encodeURIComponent(email).replace(/%40/g, "@")}` });
  }
  const configuredHref = safeContactDestination(settings?.globalCtaHref);
  const href = configuredHref ?? DEFAULT_CTA_HREF;
  actions.push({ kind: "project", label: configuredHref ? textOrDefault(settings?.globalCtaLabel, DEFAULT_CTA_LABEL) : DEFAULT_CTA_LABEL, href });
  if (href.replace(/\/$/, "") !== DEFAULT_CTA_HREF) actions.push({ kind: "quote", label: "Request Quote", href: DEFAULT_CTA_HREF });
  if (href !== "/contact#consultation") actions.push({ kind: "contact", label: "Discuss your project", href: "/contact#consultation" });
  return actions;
}

/** Positive scope: never mount on forms, legal reading or private/account routes. */

