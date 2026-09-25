import "server-only";
import { escapeHtml } from "@/lib/email/escape";
import {
  button,
  detailsCard,
  emailShell,
  filledRows,
  paragraph,
  signature,
  textLink,
  textRows,
} from "@/lib/email/layout";
import { BRAND } from "@/lib/seo/site";

/**
 * Branded, email-client-safe templates. Every dynamic value is HTML-escaped —
 * values come from public form submissions and must never inject markup.
 * Each template returns a plain-text twin so mail is multipart (better
 * inbox placement than HTML-only).
 */

export type LeadEmailContent = {
  kind: "contact" | "quote" | "appointment";
  fromName: string;
  fromEmail: string;
  fields: { label: string; value: string | null }[];
  message: string | null;
  adminPath: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

const KIND_LABEL: Record<LeadEmailContent["kind"], string> = {
  contact: "Contact message",
  quote: "Quote request",
  appointment: "Consultation booking",
};

export function renderAdminNotification(
  content: LeadEmailContent,
  siteUrl: string,
): RenderedEmail {
  const kindLabel = KIND_LABEL[content.kind];
  const rows = filledRows([
    { label: "Name", value: content.fromName },
    { label: "Email", value: content.fromEmail },
    ...content.fields,
    { label: "Message", value: content.message },
  ]);
  const inboxUrl = siteUrl ? `${siteUrl}${content.adminPath}` : "";

  const bodyHtml = [
    paragraph(
      `You have a new <strong>${escapeHtml(kindLabel.toLowerCase())}</strong> from <strong>${escapeHtml(content.fromName)}</strong>. Reply to this email to respond directly to them.`,
    ),
    detailsCard("Lead details", rows),
    inboxUrl ? `<p style="margin:0;">${button(inboxUrl, "Open in lead inbox")}</p>` : "",
  ].join("");

  return {
    subject: `New ${kindLabel.toLowerCase()} from ${content.fromName}`,
    html: emailShell({
      preheader: `${kindLabel} from ${content.fromName} (${content.fromEmail})`,
      badge: `New ${kindLabel}`,
      heading: `${kindLabel} received`,
      bodyHtml,
      siteUrl,
      footerNote: "Internal notification from your website lead inbox.",
    }),
    text: [
      `New ${kindLabel.toLowerCase()} from ${content.fromName}`,
      "",
      textRows(rows),
      "",
      inboxUrl ? `Open in lead inbox: ${inboxUrl}` : "",
      "Reply to this email to respond directly to the sender.",
    ].join("\n"),
  };
}

const VISITOR_COPY: Record<
  LeadEmailContent["kind"],
  { subject: string; badge: string; heading: string; intro: string; summary: string; next: string }
> = {
  contact: {
    subject: "We received your message",
    badge: "Message received",
    heading: "Thank you for getting in touch",
    intro:
      "We have received your message and our team is already reviewing it. A member of our team will personally get back to you within one business day.",
    summary: "Your message",
    next: "If you would like to add anything, simply reply to this email. It comes straight to our team.",
  },
  quote: {
    subject: "Your quote request has been received",
    badge: "Request received",
    heading: "Thank you for your quote request",
    intro:
      "We have received your project requirements. Our team will study them carefully and share a tailored proposal with scope, timeline and pricing, usually within one business day.",
    summary: "Your request summary",
    next: "Have more details, documents or references to share? Just reply to this email.",
  },
  appointment: {
    subject: "Your consultation is confirmed",
    badge: "Booking confirmed",
    heading: "Your consultation is confirmed",
    intro:
      "Thank you for booking a consultation with us. Your slot is reserved and we look forward to speaking with you. We will reach out before the meeting with the call details.",
    summary: "Appointment details",
    next: "Need to reschedule or add an agenda point? Simply reply to this email.",
  },
};

export function renderVisitorConfirmation(
  content: LeadEmailContent,
  siteUrl: string,
): RenderedEmail {
  const copy = VISITOR_COPY[content.kind];
  const rows = filledRows([...content.fields, { label: "Message", value: content.message }]);

  const bodyHtml = [
    paragraph(`Dear ${escapeHtml(content.fromName)},`),
    paragraph(escapeHtml(copy.intro)),
    detailsCard(copy.summary, rows),
    paragraph(escapeHtml(copy.next)),
    siteUrl
      ? `<p style="margin:6px 0 26px;">${button(siteUrl, "Visit our website")}${textLink(`${siteUrl}/services`, "Explore our services")}</p>`
      : "",
    signature(siteUrl),
  ].join("");

  return {
    subject: `${copy.subject} - ${BRAND.shortName}`,
    html: emailShell({
      preheader: copy.intro,
      badge: copy.badge,
      heading: copy.heading,
      bodyHtml,
      siteUrl,
      footerNote: "You are receiving this email because you submitted a form on our website.",
    }),
    text: [
      `Dear ${content.fromName},`,
      "",
      copy.intro,
      "",
      rows.length ? `${copy.summary}:\n${textRows(rows)}\n` : "",
      copy.next,
      "",
      siteUrl ? `Website: ${siteUrl}\nServices: ${siteUrl}/services\n` : "",
      "Warm regards,",
      BRAND.founderName,
      `Founder, ${BRAND.primaryName}`,
    ].join("\n"),
  };
}

export function renderPasswordRecovery(recoveryUrl: string): RenderedEmail {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  const bodyHtml = [
    paragraph("We received a request to set a new password for your secure client portal account."),
    `<p style="margin:6px 0 22px;">${button(recoveryUrl, "Choose a new password")}</p>`,
    paragraph(
      "This secure link can be used once. If you did not request it, you can safely ignore this email.",
    ),
  ].join("");
  return {
    subject: `Reset your ${BRAND.shortName} password`,
    html: emailShell({
      preheader: "Use this secure link to choose a new password.",
      badge: "Account security",
      heading: "Reset your password",
      bodyHtml,
      siteUrl,
      footerNote: "You are receiving this email because a password reset was requested.",
    }),
    text: [
      "We received a request to set a new password for your client portal account.",
      "",
      `Choose a new password: ${recoveryUrl}`,
      "",
      "This link can be used once. If you did not request it, you can ignore this email.",
    ].join("\n"),
  };
}
