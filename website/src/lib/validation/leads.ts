import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

// z.optional() outer wrapper matters: Zod 4 marks object keys optional by
// that flag, so absent FormData keys fall through to "" instead of erroring.
const optionalText = (max: number) =>
  z.optional(z.string().trim().max(max)).transform((value) => value ?? "");

const emailField = z.email("Enter a valid email address").max(200);
const phoneField = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+()\-.\s0-9]{6,20}$/, "Enter a valid phone number");

/** Honeypot + minimum fill time — bots trip these, humans never notice. */
export const spamGuardSchema = z.object({
  website: optionalText(100), // honeypot: must stay empty
  startedAt: z.coerce.number().int().nonnegative(),
});

export function assertNotSpam(
  guard: z.infer<typeof spamGuardSchema>,
  { minFillMs = 2000, maxAgeMs = 60 * 60 * 1000 }: { minFillMs?: number; maxAgeMs?: number } = {},
): string | null {
  if (guard.website !== "") return "Spam detected.";
  const elapsed = Date.now() - guard.startedAt;
  if (!Number.isFinite(elapsed) || elapsed < minFillMs)
    return "Please take a moment to fill the form.";
  if (elapsed > maxAgeMs) return "The form expired. Please submit again.";
  return null;
}

/** Unchecked checkbox → key absent → false. Never pre-checked in the UI. */
export const checkboxField = z
  .optional(z.union([z.literal("on"), z.literal("true"), z.boolean()]))
  .transform((value) => value === "on" || value === "true" || value === true);

export const AGREEMENT_REQUIRED_MESSAGE =
  "Please read and accept the Service Agreement to continue.";

export const contactSchema = spamGuardSchema.extend({
  name: text(120).refine((value) => value.length >= 2, "Enter your name"),
  email: emailField,
  phone: phoneField,
  company: text(160).refine((value) => value.length >= 2, "Enter your company or business name"),
  message: text(4000).refine(
    (value) => value.length >= 10,
    "Tell us a little more (at least 10 characters)",
  ),
  agreementAccepted: checkboxField,
});

export type ContactInput = z.infer<typeof contactSchema>;

export const quoteSchema = spamGuardSchema.extend({
  fullName: text(120).refine((value) => value.length >= 2, "Enter your full name"),
  company: optionalText(160),
  email: emailField,
  phone: z.optional(z.union([phoneField, z.literal("")])).transform((value) => value ?? ""),
  whatsapp: optionalText(20),
  location: optionalText(160),
  projectType: optionalText(80),
  platform: optionalText(80),
  industry: optionalText(80),
  budgetRange: optionalText(80),
  timeline: optionalText(80),
  requirements: text(8000).refine(
    (value) => value.length >= 20,
    "Describe your requirements (at least 20 characters)",
  ),
  preferredContact: z.enum(["email", "phone", "whatsapp"]).default("email"),
  consent: checkboxField,
  agreementAccepted: checkboxField,
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const appointmentSchema = spamGuardSchema.extend({
  name: text(120).refine((value) => value.length >= 2, "Enter your name"),
  email: emailField,
  phone: z.optional(z.union([phoneField, z.literal("")])).transform((value) => value ?? ""),
  preferredDate: optionalText(20),
  preferredTime: optionalText(40),
  topic: optionalText(160),
  message: optionalText(2000),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

/** Quote attachment: ≤ 10 MB, safe document/image types only. */
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MIME_ALLOW = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export function validateAttachment(file: File | null): string | null {
  if (!file || file.size === 0) return null; // attachment is optional
  if (file.size > ATTACHMENT_MAX_BYTES) return "Attachment must be 10 MB or smaller.";
  if (!(ATTACHMENT_MIME_ALLOW as readonly string[]).includes(file.type)) {
    return "Attachment must be a PDF, image or Word (.docx) file.";
  }
  return null;
}

export const LEAD_STATUSES = [
  "new",
  "reviewing",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
  "spam",
] as const;

export const leadStatusSchema = z.enum(LEAD_STATUSES);
export type LeadStatus = z.infer<typeof leadStatusSchema>;
