import "server-only";
import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";
import { stripHeaderBreaks } from "@/lib/email/escape";
import {
  renderAdminNotification,
  renderPasswordRecovery,
  renderVisitorConfirmation,
  type LeadEmailContent,
  type RenderedEmail,
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
let cachedGmail: Transporter | null = null;

function client(): Resend {
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}

/**
 * Gmail SMTP (free, preferred when set):
 *   GMAIL_USER          — the Gmail address that sends (and, by default, receives) notifications
 *   GMAIL_APP_PASSWORD  — 16-char Google App Password (Google Account → Security → App passwords)
 */
function isGmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function gmail(): Transporter {
  if (!cachedGmail) {
    cachedGmail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, ""),
      },
    });
  }
  return cachedGmail;
}

/** Admin inbox: EMAIL_ADMIN_TO, else the sending Gmail account itself. */
export function adminRecipient(): string | null {
  return process.env.EMAIL_ADMIN_TO || process.env.GMAIL_USER || null;
}

export async function sendPasswordRecoveryEmail(
  to: string,
  recoveryUrl: string,
): Promise<{ attempted: boolean; delivered: boolean }> {
  if (!isEmailConfigured()) return { attempted: false, delivered: false };
  const email = renderPasswordRecovery(recoveryUrl);
  return {
    attempted: true,
    delivered: await sendOne(to, email),
  };
}

export function isEmailConfigured(): boolean {
  return isGmailConfigured() || Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function fromAddress(): string {
  if (isGmailConfigured()) {
    return stripHeaderBreaks(`AJS Technology <${process.env.GMAIL_USER}>`);
  }
  return stripHeaderBreaks(process.env.EMAIL_FROM ?? "AJS Technology <onboarding@resend.dev>");
}

/**
 * Inbox-placement basics: multipart (plain text + HTML), a real Reply-To, and
 * a List-Unsubscribe header on visitor mail. Gmail SMTP signs with DKIM/SPF
 * for the sending account automatically.
 */
async function sendOne(
  to: string,
  email: RenderedEmail,
  options: { replyTo?: string | null; unsubscribe?: boolean } = {},
): Promise<boolean> {
  const message = {
    from: fromAddress(),
    to: stripHeaderBreaks(to),
    subject: stripHeaderBreaks(email.subject),
    html: email.html,
    text: email.text,
    replyTo: options.replyTo ? stripHeaderBreaks(options.replyTo) : undefined,
  };
  const unsubscribeTo = options.unsubscribe ? adminRecipient() : null;
  const headers: Record<string, string> = unsubscribeTo
    ? { "List-Unsubscribe": `<mailto:${stripHeaderBreaks(unsubscribeTo)}?subject=unsubscribe>` }
    : {};

  if (isGmailConfigured()) {
    try {
      await gmail().sendMail({ ...message, headers });
      return true;
    } catch (cause) {
      console.error("[email] gmail delivery failed:", cause instanceof Error ? cause.message : cause);
      return false;
    }
  }
  try {
    const { error } = await client().emails.send({ ...message, headers });
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

  // Subjects/headers are newline-stripped in sendOne (header-injection safe).
  // Admin replies go straight to the visitor; visitor replies reach the admin.
  const [adminNotified, confirmationSent] = await Promise.all([
    adminRecipient
      ? sendOne(adminRecipient, admin, { replyTo: content.fromEmail })
      : Promise.resolve(false),
    sendOne(content.fromEmail, visitor, { replyTo: adminRecipient, unsubscribe: true }),
  ]);

  return { attempted: true, adminNotified, confirmationSent };
}
