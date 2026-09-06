import "server-only";
import { Resend } from "resend";
import { escapeHtml, stripHeaderBreaks } from "@/lib/email/escape";
import {
  renderAdminNotification,
  renderPasswordRecovery,
  renderVisitorConfirmation,
  type LeadEmailContent,
} from "@/lib/email/templates";

/**
 * Transactional email via Resend (https://resend.com).
 *
 * Configuration (server-only, never NEXT_PUBLIC_):
 *   RESEND_API_KEY  — API key from the Resend dashboard
 *   EMAIL_FROM      — verified sender, e.g. "AJS Technology <notifications@your-domain.com>"
 *
 * When either is missing the helpers below report { attempted: false } and the
 * calling action continues — the lead is already saved in the database, so a
 * missing email integration must never fake or block the flow. Delivery
 * results are logged server-side with counts only, never content.
 */

let cachedClient: Resend | null = null;

function client(): Resend {
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}

export async function sendPasswordRecoveryEmail(
  to: string,
  recoveryUrl: string,
): Promise<{ attempted: boolean; delivered: boolean }> {
  if (!isEmailConfigured()) return { attempted: false, delivered: false };
  const email = renderPasswordRecovery(recoveryUrl);
  return {
    attempted: true,
    delivered: await sendOne(to, email.subject, email.html),
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function fromAddress(): string {
  return stripHeaderBreaks(process.env.EMAIL_FROM ?? "AJS Technology <onboarding@resend.dev>");
}

async function sendOne(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const { error } = await client().emails.send({
      from: fromAddress(),
      to: stripHeaderBreaks(to),
      subject: stripHeaderBreaks(subject),
      html,
    });
    if (error) {
      console.error(`[email] delivery rejected: ${error.message}`);
      return false;
    }
    return true;
  } catch (cause) {
    console.error("[email] delivery failed:", cause instanceof Error ? cause.message : cause);
    return false;
  }
}

export type EmailDelivery = {
  attempted: boolean;
  adminNotified: boolean;
  confirmationSent: boolean;
};

/**
 * Send the admin notification + visitor confirmation for a saved lead.
 * The admin recipient is EMAIL_ADMIN_TO when set, otherwise the contact
 * email configured in Brand Settings is NOT used here on purpose — the
 * env var keeps the recipient under deployment control.
 */
export async function sendLeadEmails(
  content: LeadEmailContent,
  adminRecipient: string | null,
): Promise<EmailDelivery> {
  if (!isEmailConfigured()) {
    return { attempted: false, adminNotified: false, confirmationSent: false };
  }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  const admin = renderAdminNotification(content, siteUrl);
  const visitor = renderVisitorConfirmation(content, siteUrl);

  // Names/emails are header-safe; subjects never include raw visitor input
  // beyond the escaped, newline-stripped name.
  const safeName = stripHeaderBreaks(escapeHtml(content.fromName));

  const [adminNotified, confirmationSent] = await Promise.all([
    adminRecipient
      ? sendOne(adminRecipient, admin.subject.replace(content.fromName, safeName), admin.html)
      : Promise.resolve(false),
    sendOne(content.fromEmail, visitor.subject, visitor.html),
  ]);

  return { attempted: true, adminNotified, confirmationSent };
}
