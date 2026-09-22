import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import sticky from "./demo-sticky-cta.module.css";

/**
 * Mobile-only sticky action bar for the homepage: the quote CTA and the
 * admin-configured WhatsApp link stay on screen while the visitor scrolls. It
 * is CSS-only (no client JS) and leaves the right corner free so the existing
 * site-wide ContactHub trigger is not covered.
 */
export function DemoStickyCta({
  ctaHref,
  ctaLabel,
  whatsappHref,
}: {
  ctaHref: string;
  ctaLabel: string;
  whatsappHref: string | null;
}) {
  return (
    <div className={sticky.bar} data-home-section="sticky-cta">
      <Link className={`${sticky.action} ${sticky.primary}`} href={ctaHref}>
        {ctaLabel}
        <ArrowRight size={15} aria-hidden />
      </Link>
      {whatsappHref ? (
        <a className={sticky.action} href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={15} aria-hidden />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
