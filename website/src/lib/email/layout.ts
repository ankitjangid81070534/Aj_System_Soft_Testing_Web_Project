import "server-only";
import { escapeHtml } from "@/lib/email/escape";
import { BRAND } from "@/lib/seo/site";

/**
 * Shared, email-client-safe layout. Table-based with inline styles only (the
 * format Gmail/Outlook/Apple Mail render reliably), no external images or
 * scripts, and every template ships a plain-text twin — HTML-only mail with
 * heavy markup is one of the strongest spam signals.
 */

export type DetailRow = { label: string; value: string };

const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const INK = "#0b1220";
const BODY = "#3a4458";
const MUTED = "#6b7489";
const BLUE = "#2347dd";
const VIOLET = "#6a3de8";

export function filledRows(fields: { label: string; value: string | null }[]): DetailRow[] {
  return fields.filter(
    (field): field is DetailRow => typeof field.value === "string" && field.value.trim() !== "",
  );
}

/** Inset "floating" card holding a label/value list. */
export function detailsCard(title: string, rows: DetailRow[]): string {
  if (rows.length === 0) return "";
  const body = rows
    .map(({ label, value }, index) => {
      const divider = index ? "border-top:1px solid #e8ecf5;" : "";
      return `<tr>
          <td style="padding:12px 18px;${divider}font:600 13px/1.5 ${FONT};color:${MUTED};width:34%;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:12px 18px;${divider}font:500 14px/1.6 ${FONT};color:${INK};white-space:pre-wrap;word-break:break-word;">${escapeHtml(value)}</td>
        </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px;border-collapse:separate;background:#f7f9fd;border:1px solid #e3e8f3;border-radius:14px;box-shadow:0 10px 24px -14px rgba(35,71,221,0.35);">
      <tr><td colspan="2" style="padding:14px 18px 10px;border-bottom:1px solid #e3e8f3;font:700 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${BLUE};">${escapeHtml(title)}</td></tr>
      ${body}
    </table>`;
}

/** Raised, glossy pill button (darker bottom edge gives the 3D depth). */
export function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${BLUE};background-image:linear-gradient(135deg,${BLUE} 0%,${VIOLET} 100%);color:#ffffff;font:700 14px/1 ${FONT};text-decoration:none;padding:15px 26px;border-radius:999px;border-bottom:3px solid #1a2f9e;box-shadow:0 12px 22px -10px rgba(58,61,232,0.65);">${escapeHtml(label)}</a>`;
}

export function textLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;color:${BLUE};font:700 14px/1 ${FONT};text-decoration:none;padding:15px 12px;">${escapeHtml(label)} &rarr;</a>`;
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font:400 15px/1.7 ${FONT};color:${BODY};">${html}</p>`;
}

export function signature(siteUrl: string): string {
  const host = siteUrl.replace(/^https?:\/\//, "");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;border-top:1px solid #e8ecf5;width:100%;">
      <tr><td style="padding-top:20px;font:400 14px/1.7 ${FONT};color:${BODY};">
        Warm regards,<br />
        <strong style="font-size:15px;color:${INK};">${escapeHtml(BRAND.founderName)}</strong><br />
        <span style="color:${MUTED};">Founder, ${escapeHtml(BRAND.primaryName)}</span>
        ${siteUrl ? `<br /><a href="${escapeHtml(siteUrl)}" style="color:${BLUE};text-decoration:none;">${escapeHtml(host)}</a>` : ""}
      </td></tr>
    </table>`;
}

export function emailShell(options: {
  preheader: string;
  badge: string;
  heading: string;
  bodyHtml: string;
  siteUrl: string;
  footerNote: string;
}): string {
  const host = options.siteUrl.replace(/^https?:\/\//, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(options.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#eaeef7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eaeef7;">
  <tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;border-collapse:separate;">
      <tr><td style="background:${BLUE};background-image:linear-gradient(135deg,#1c3bc9 0%,${BLUE} 45%,${VIOLET} 100%);border-radius:22px 22px 0 0;padding:30px 34px 70px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="52" style="vertical-align:middle;">
            <div style="width:48px;height:48px;border-radius:14px;background:#ffffff;background-image:linear-gradient(160deg,#ffffff 0%,#dfe6ff 100%);border-bottom:3px solid #b9c6ff;box-shadow:0 10px 20px -6px rgba(10,20,80,0.55);text-align:center;font:800 17px/48px ${FONT};color:${BLUE};">AJ</div>
          </td>
          <td style="vertical-align:middle;padding-left:14px;">
            <div style="font:700 17px/1.2 ${FONT};color:#ffffff;">${escapeHtml(BRAND.primaryName)}</div>
            <div style="font:400 12px/1.5 ${FONT};color:#d6ddff;padding-top:3px;">${escapeHtml(BRAND.tagline)}</div>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:-44px;background:#ffffff;border-radius:20px;border:1px solid #e1e6f2;box-shadow:0 30px 60px -28px rgba(20,33,90,0.45),0 8px 18px -10px rgba(20,33,90,0.18);">
          <tr><td style="padding:34px 32px 30px;">
            <span style="display:inline-block;background:#eef2ff;border:1px solid #d9e0ff;color:${BLUE};font:700 11px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;padding:8px 12px;border-radius:999px;">&#10003;&nbsp; ${escapeHtml(options.badge)}</span>
            <h1 style="margin:18px 0;font:800 24px/1.3 ${FONT};color:${INK};">${escapeHtml(options.heading)}</h1>
            ${options.bodyHtml}
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:26px 34px 8px;text-align:center;">
        <div style="font:700 13px/1.4 ${FONT};color:${INK};">${escapeHtml(BRAND.primaryName)}</div>
        ${options.siteUrl ? `<div style="font:400 12px/1.7 ${FONT};padding-top:4px;"><a href="${escapeHtml(options.siteUrl)}" style="color:${BLUE};text-decoration:none;">${escapeHtml(host)}</a></div>` : ""}
        <div style="font:400 11px/1.7 ${FONT};color:#8a93a8;padding-top:10px;">${escapeHtml(options.footerNote)}</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Plain-text twin of a details list. */
export function textRows(rows: DetailRow[]): string {
  return rows.map(({ label, value }) => `${label}: ${value}`).join("\n");
}
