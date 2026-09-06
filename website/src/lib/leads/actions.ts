"use server";

import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";
import {
  AGREEMENT_REQUIRED_MESSAGE,
  appointmentSchema,
  assertNotSpam,
  contactSchema,
  quoteSchema,
  validateAttachment,
} from "@/lib/validation/leads";
import { isEmailConfigured, sendLeadEmails } from "@/lib/email/email";
import { recordAgreementAcceptance } from "@/lib/agreements/acceptance";
import { getCurrentServiceAgreement } from "@/lib/agreements/data";

/**
 * The agreement checkbox is mandatory whenever a published Service Agreement
 * exists. Before the agreement is seeded (or when Supabase is offline) the
 * forms keep working so a legal-content gap never blocks real enquiries.
 */
async function agreementGate(accepted: boolean): Promise<string | null> {
  if (accepted || !isSupabaseConfigured) return null;
  const current = await getCurrentServiceAgreement();
  return current ? AGREEMENT_REQUIRED_MESSAGE : null;
}

export type LeadFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

function failure(message: string): LeadFormState {
  return { status: "error", message };
}

async function spamAndRateLimitGuard(
  guard: { website: string; startedAt: number },
  routeKey: string,
  email: string,
): Promise<string | null> {
  const spamMessage = assertNotSpam(guard);
  if (spamMessage) return spamMessage;

  const requestHeaders = await headers();
  const ip = clientIpFrom(requestHeaders);
  if (isRateLimited(`${routeKey}:${ip}`)) {
    return "Too many submissions from your network. Please try again later.";
  }
  if (
    email &&
    isRateLimited(`${routeKey}:email:${email.toLowerCase()}`, { windowMs: 60 * 60 * 1000, max: 3 })
  ) {
    return "This address has submitted several times already. Please try again later.";
  }
  return null;
}

const ATTACHMENT_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

async function uploadAttachment(file: File): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const ext = ATTACHMENT_EXT[file.type] ?? "bin";
  const path = `leads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from("lead-attachments").upload(path, file, {
    contentType: file.type,
  });
  if (error) return null;
  return path;
}

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function submitContactAction(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = contactSchema.safeParse({
    website: formString(formData, "website") ?? "",
    startedAt: formString(formData, "startedAt") ?? "0",
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone") ?? "",
    company: formString(formData, "company"),
    message: formString(formData, "message"),
    agreementAccepted: formString(formData, "agreementAccepted"),
  });
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Please check the highlighted fields.");
  }
  const agreementError = await agreementGate(parsed.data.agreementAccepted);
  if (agreementError) return failure(agreementError);
  const spam = await spamAndRateLimitGuard(parsed.data, "contact", parsed.data.email);
  if (spam) return failure(spam);
  if (!isSupabaseConfigured) {
    return failure("Online submissions are not enabled yet. Please reach us directly.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createSupabaseAdminClient();
  const { data: inserted, error } = await admin
    .from("contact_submissions")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      message: parsed.data.message,
      source_page: "/contact",
      auth_user_id: user?.id ?? null,
    })
    .select("id")
    .limit(1);
  if (error) {
    console.error("contact insert failed:", error.message);
    return failure("Your message could not be saved right now. Please try again in a moment.");
  }

  if (parsed.data.agreementAccepted) {
    await recordAgreementAcceptance({
      context: "contact",
      userId: user?.id ?? null,
      fullName: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      relatedTable: "contact_submissions",
      relatedId: inserted?.[0]?.id ? String(inserted[0].id) : null,
    });
  }

  if (isEmailConfigured()) {
    const delivery = await sendLeadEmails(
      {
        kind: "contact",
        fromName: parsed.data.name,
        fromEmail: parsed.data.email,
        fields: [
          { label: "Phone", value: parsed.data.phone || null },
          { label: "Company", value: parsed.data.company || null },
        ],
        message: parsed.data.message,
        adminPath: "/ajadmin/leads?tab=messages",
      },
      process.env.EMAIL_ADMIN_TO ?? null,
    );
    if (!delivery.adminNotified) {
      console.error("[email] admin notification not delivered for a contact submission");
    }
  }

  return { status: "success", message: "Thanks — your message has reached us." };
}

export async function submitQuoteAction(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const attachment = formData.get("attachment");
  const attachmentFile = attachment instanceof File ? attachment : null;
  const parsed = quoteSchema.safeParse({
    website: formString(formData, "website") ?? "",
    startedAt: formString(formData, "startedAt") ?? "0",
    fullName: formString(formData, "fullName"),
    company: formString(formData, "company"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone") ?? "",
    whatsapp: formString(formData, "whatsapp"),
    location: formString(formData, "location"),
    projectType: formString(formData, "projectType"),
    platform: formString(formData, "platform"),
    industry: formString(formData, "industry"),
    budgetRange: formString(formData, "budgetRange"),
    timeline: formString(formData, "timeline"),
    requirements: formString(formData, "requirements"),
    preferredContact: formString(formData, "preferredContact") ?? "email",
    consent: formString(formData, "consent"),
    agreementAccepted: formString(formData, "agreementAccepted"),
  });
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Please check the highlighted fields.");
  }
  if (!parsed.data.consent) {
    return failure("Please accept the data-use consent so we may reply to your request.");
  }
  const agreementError = await agreementGate(parsed.data.agreementAccepted);
  if (agreementError) return failure(agreementError);
  const attachmentError = validateAttachment(attachmentFile);
  if (attachmentError) return failure(attachmentError);

  const spam = await spamAndRateLimitGuard(parsed.data, "quote", parsed.data.email);
  if (spam) return failure(spam);
  if (!isSupabaseConfigured) {
    return failure("Online submissions are not enabled yet. Please reach us directly.");
  }

  let attachmentPath: string | null = null;
  if (attachmentFile && attachmentFile.size > 0) {
    attachmentPath = await uploadAttachment(attachmentFile);
    if (!attachmentPath) {
      return failure(
        "The attachment could not be uploaded. Please retry, or submit without the attachment.",
      );
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createSupabaseAdminClient();
  const { data: inserted, error } = await admin
    .from("quote_requests")
    .insert({
    full_name: parsed.data.fullName,
    company: parsed.data.company || null,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    whatsapp: parsed.data.whatsapp || null,
    location: parsed.data.location || null,
    project_type: parsed.data.projectType || null,
    platform: parsed.data.platform || null,
    industry: parsed.data.industry || null,
    budget_range: parsed.data.budgetRange || null,
    timeline: parsed.data.timeline || null,
    requirements: parsed.data.requirements,
    attachment_url: attachmentPath,
    preferred_contact: parsed.data.preferredContact,
    consent: parsed.data.consent,
    auth_user_id: user?.id ?? null,
    })
    .select("id")
    .limit(1);
  if (error) {
    console.error("quote insert failed:", error.message);
    return failure("Your request could not be saved right now. Please try again in a moment.");
  }

  if (parsed.data.agreementAccepted) {
    await recordAgreementAcceptance({
      context: "quote",
      userId: user?.id ?? null,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || parsed.data.whatsapp || null,
      relatedTable: "quote_requests",
      relatedId: inserted?.[0]?.id ? String(inserted[0].id) : null,
    });
  }

  if (isEmailConfigured()) {
    const delivery = await sendLeadEmails(
      {
        kind: "quote",
        fromName: parsed.data.fullName,
        fromEmail: parsed.data.email,
        fields: [
          { label: "Phone", value: parsed.data.phone || null },
          { label: "Company", value: parsed.data.company || null },
          { label: "Location", value: parsed.data.location || null },
          { label: "Project type", value: parsed.data.projectType || null },
          { label: "Platform", value: parsed.data.platform || null },
          { label: "Industry", value: parsed.data.industry || null },
          { label: "Budget", value: parsed.data.budgetRange || null },
          { label: "Timeline", value: parsed.data.timeline || null },
          { label: "Requirements", value: parsed.data.requirements },
          { label: "Attachment", value: attachmentPath ? "uploaded (see lead inbox)" : null },
        ],
        message: null,
        adminPath: "/ajadmin/leads?tab=quotes",
      },
      process.env.EMAIL_ADMIN_TO ?? null,
    );
    if (!delivery.adminNotified || !delivery.confirmationSent) {
      console.error(
        `[email] quote notifications partial: admin=${delivery.adminNotified} confirmation=${delivery.confirmationSent}`,
      );
    }
  }

  return { status: "success", message: "Thanks — your quote request has reached us." };
}

export async function requestAppointmentAction(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = appointmentSchema.safeParse({
    website: formString(formData, "website") ?? "",
    startedAt: formString(formData, "startedAt") ?? "0",
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone") ?? "",
    preferredDate: formString(formData, "preferredDate"),
    preferredTime: formString(formData, "preferredTime"),
    topic: formString(formData, "topic"),
    message: formString(formData, "message"),
  });
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Please check the highlighted fields.");
  }
  const spam = await spamAndRateLimitGuard(parsed.data, "appointment", parsed.data.email);
  if (spam) return failure(spam);
  if (!isSupabaseConfigured) {
    return failure("Online bookings are not enabled yet. Please reach us directly.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("appointment_requests").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    preferred_date: parsed.data.preferredDate || null,
    preferred_time: parsed.data.preferredTime || null,
    topic: parsed.data.topic || null,
    message: parsed.data.message || "",
  });
  if (error) {
    console.error("appointment insert failed:", error.message);
    return failure("Your request could not be saved right now. Please try again in a moment.");
  }

  if (isEmailConfigured()) {
    await sendLeadEmails(
      {
        kind: "appointment",
        fromName: parsed.data.name,
        fromEmail: parsed.data.email,
        fields: [
          { label: "Phone", value: parsed.data.phone || null },
          { label: "Preferred date", value: parsed.data.preferredDate || null },
          { label: "Preferred time", value: parsed.data.preferredTime || null },
          { label: "Topic", value: parsed.data.topic || null },
        ],
        message: parsed.data.message,
        adminPath: "/ajadmin/leads?tab=appointments",
      },
      process.env.EMAIL_ADMIN_TO ?? null,
    );
  }

  return { status: "success", message: "Thanks — your consultation request has reached us." };
}
