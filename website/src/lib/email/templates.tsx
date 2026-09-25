import "server-only";
import { escapeHtml } from "@/lib/email/escape";
import { BRAND } from "@/lib/seo/site";

/**
 * Branded, email-client-safe templates. Inline styles only, no external
 * images, every dynamic value HTML-escaped — values come from public form
 * submissions and must never be able to inject markup.
 */

export type LeadEmailContent = {
  kind: "contact" | "quote" | "appointment";
  fromName: string;
  fromEmail: string;
  fields: { label: string; value: string | null }[];
  message: string | null;
  adminPath: string;
};

export function renderAdminNotification(
  content: LeadEmailContent,
  siteUrl: string,
): { subject: string; html: string } {
  const kindLabel =
    content.kind === "quote"
      ? "Quote request"
      : content.kind === "appointment"
        ? "Consultation request"
        : "Contact message";

  const rows = [
    ...content.fields.filter(
      (field): field is { label: string; value: string } =>
        typeof field.value === "string" && field.value !== "",
    ),
    { label: "Reply to", value: content.fromEmail },
    ...(content.message ? [{ label: "Message", value: content.message }] : []),
  ]
    .map(
      ({ label, value }) => `<tr>
        <td style="padding:8px 12px;border:1px solid #e4e7ee;font-weight:600;color:#0b1220;background:#f5f6f8;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border:1px solid #e4e7ee;color:#2a3447;white-space:pre-wrap;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  return {
    subject: `[AJS] ${kindLabel} from ${content.fromName}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
      <div style="background:#2347dd;padding:20px 24px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;">AJ System Soft Technology</span>
        <span style="color:#dbe6ff;font-size:13px;float:right;">Admin notification</span>
      </div>
      <div style="padding:24px;">
        <p style="color:#0b1220;font-size:16px;margin:0 0 12px;"><strong>${escapeHtml(kindLabel)}</strong> received from ${escapeHtml(content.fromName)} (${escapeHtml(content.fromEmail)}).</p>
        <table style="border-collapse:collapse;width:100%;">${rows}</table>
        <p style="margin:20px 0 0;">
          <a href="${siteUrl}${content.adminPath}" style="background:#2347dd;color:#ffffff;padding:10px 18px;border-radius:9999px;text-decoration:none;font-size:14px;">Open in lead inbox</a>
        </p>
      </div>
    </div>`,
  };
}

const VISITOR_COPY: Record<
  LeadEmailContent["kind"],
  { subject: string; heading: string; intro: string; summary: string }
> = {
  contact: {
    subject: "Thank you for contacting us",
    heading: "Thank you for getting in touch",
    intro:
      "We have received your message and our team is already reviewing it. A member of our team will personally get back to you within one business day.",
    summary: "Your message",
  },
  quote: {
    subject: "Your quote request has been received",
    heading: "Thank you for your quote request",
    intro:
      "We have received your project requirements. Our team will study them carefully and share a tailored proposal with scope, timeline and pricing, usually within one business day.",
    summary: "Your request summary",
  },
  appointment: {
    subject: "Your consultation is confirmed",
    heading: "Your consultation is confirmed",
    intro:
      "Thank you for booking a consultation with us. Your slot is reserved and we look forward to speaking with you. We will reach out before the meeting with the call details.",
    summary: "Appointment details",
  },
};

export function renderVisitorConfirmation(
  content: LeadEmailContent,
  siteUrl: string,
): { subject: string; html: string } {
  const copy = VISITOR_COPY[content.kind];
  const siteHost = escapeHtml(siteUrl.replace(/^https?:\/\//, ""));
  const rows = [
    ...content.fields.filter(
      (field): field is { label: string; value: string } =>
        typeof field.value === "string" && field.value !== "",
    ),
    ...(content.message ? [{ label: "Message", value: content.message }] : []),
  ]
    .map(
      ({ label, value }) => `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e4e7ee;font-weight:600;color:#0b1220;width:32%;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e4e7ee;color:#2a3447;white-space:pre-wrap;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  return {
    subject: `${copy.subject}, ${content.fromName} | ${BRAND.primaryName}`,
    html: `<div style="background:#f3f5f9;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e7ee;">
      <div style="background:#2347dd;background:linear-gradient(135deg,#2347dd,#6a3de8);padding:28px 32px;">
        <div style="color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(BRAND.primaryName)}</div>
        <div style="color:#dbe6ff;font-size:13px;margin-top:4px;">${escapeHtml(BRAND.tagline)}</div>
      </div>
      <div style="padding:32px;color:#2a3447;font-size:15px;line-height:1.65;">
        <h1 style="color:#0b1220;font-size:22px;margin:0 0 16px;">${escapeHtml(copy.heading)}</h1>
        <p style="margin:0 0 14px;">Dear ${escapeHtml(content.fromName)},</p>
        <p style="margin:0 0 20px;">${escapeHtml(copy.intro)}</p>
        ${
          rows
            ? `<div style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2347dd;margin:0 0 8px;">${escapeHtml(copy.summary)}</div>
        <table style="border-collapse:collapse;width:100%;background:#f8f9fc;margin:0 0 24px;">${rows}</table>`
            : ""
        }
        <p style="margin:0 0 24px;">If you would like to add anything or make a change, simply reply to this email — it comes straight to our team.</p>
        <p style="margin:0 0 28px;">
          <a href="${siteUrl}" style="display:inline-block;background:#2347dd;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px;">Visit our website</a>
          <a href="${siteUrl}/services" style="display:inline-block;color:#2347dd;padding:12px 16px;text-decoration:none;font-weight:600;font-size:14px;">Explore our services &rarr;</a>
        </p>
        <p style="margin:0;">Warm regards,<br />
          <strong style="color:#0b1220;">${escapeHtml(BRAND.founderName)}</strong><br />
          Founder, ${escapeHtml(BRAND.primaryName)}<br />
          <a href="${siteUrl}" style="color:#2347dd;text-decoration:none;">${siteHost}</a>
        </p>
      </div>
      <div style="background:#f8f9fc;padding:16px 32px;font-size:12px;color:#5b6478;border-top:1px solid #e4e7ee;">
        You are receiving this email because you submitted a form on <a href="${siteUrl}" style="color:#5b6478;">${siteHost}</a>.
      </div>
    </div>
  </div>`,
  };
}

export function renderPasswordRecovery(recoveryUrl: string): { subject: string; html: string } {
  const safeUrl = escapeHtml(recoveryUrl);
  return {
    subject: `Reset your ${BRAND.shortName} password`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e7ee;border-radius:20px;overflow:hidden;">
      <div style="background:#0a6fd6;padding:24px;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(BRAND.primaryName)}</span>
      </div>
      <div style="padding:28px;color:#2a3447;">
        <h1 style="color:#16181c;font-size:24px;margin:0 0 14px;">Reset your password</h1>
        <p style="margin:0 0 18px;line-height:1.6;">We received a request to set a new password for your secure client portal account.</p>
        <p style="margin:0 0 22px;">
          <a href="${safeUrl}" style="display:inline-block;background:#0a6fd6;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;">Choose a new password</a>
        </p>
        <p style="margin:0 0 10px;font-size:13px;color:#626872;line-height:1.6;">This secure link can be used once. If you did not request it, you can safely ignore this email.</p>
        <p style="margin:22px 0 0;font-size:12px;color:#626872;">${escapeHtml(BRAND.tagline)}</p>
      </div>
    </div>`,
  };
}
