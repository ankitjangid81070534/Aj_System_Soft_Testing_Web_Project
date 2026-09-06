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

export function renderVisitorConfirmation(
  content: LeadEmailContent,
  siteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `We received your ${content.kind === "quote" ? "quote request" : "message"} — ${BRAND.primaryName}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
      <div style="background:#2347dd;padding:24px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;">${escapeHtml(BRAND.primaryName)}</span>
      </div>
      <div style="padding:24px;color:#2a3447;">
        <p style="font-size:16px;margin:0 0 12px;">Hi ${escapeHtml(content.fromName)},</p>
        <p style="margin:0 0 12px;">Thank you for reaching out. Your ${content.kind === "quote" ? "quote request" : "message"} has reached us — a real person will reply, usually within one business day.</p>
        <p style="margin:0 0 12px;">Meanwhile, if anything changes about your requirements, just reply to this email.</p>
        <p style="margin:24px 0 0;">
          <a href="${siteUrl}/services" style="background:#2347dd;color:#ffffff;padding:10px 18px;border-radius:9999px;text-decoration:none;font-size:14px;">Explore our services</a>
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#5b6478;">${escapeHtml(BRAND.tagline)}<br />You are receiving this because you submitted a form on ${siteUrl.replace(/^https?:\/\//, "")}.</p>
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
