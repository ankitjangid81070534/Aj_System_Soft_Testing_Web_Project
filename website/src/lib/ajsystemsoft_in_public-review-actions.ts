"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { clientIpFrom } from "@/lib/rate-limit";
import { isRateLimitedShared } from "@/lib/ajsystemsoft_in_shared-rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { assertNotSpam } from "@/lib/validation/leads";

export type PublicReviewState = { status: "idle" | "error" | "success"; message?: string };

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  company: z.string().trim().max(120),
  role: z.string().trim().max(120),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Add a short review title.").max(120),
  reviewText: z.string().trim().min(20, "Please write at least 20 characters.").max(2000),
  website: z.string().max(100),
  startedAt: z.coerce.number().int().nonnegative(),
});

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

/**
 * Public review submission from /reviews. Saved as a private draft with
 * is_verified=false — nothing appears on the site until an admin verifies
 * and publishes it from the Testimonials module.
 */
export async function submitPublicReviewAction(
  _previous: PublicReviewState,
  formData: FormData,
): Promise<PublicReviewState> {
  const parsed = schema.safeParse({
    name: text(formData, "name"),
    company: text(formData, "company"),
    role: text(formData, "role"),
    rating: text(formData, "rating"),
    title: text(formData, "title"),
    reviewText: text(formData, "reviewText"),
    website: text(formData, "website"),
    startedAt: text(formData, "startedAt") || "0",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your review." };
  }
  const data = parsed.data;

  const spam = assertNotSpam(data);
  if (spam) return { status: "error", message: spam };

  const ip = clientIpFrom(await headers());
  if (await isRateLimitedShared(`review:${ip}`, { windowMs: 60 * 60 * 1000, max: 3 })) {
    return { status: "error", message: "Too many reviews from your network. Please try again later." };
  }
  const turnstileError = await verifyTurnstile(text(formData, "cf-turnstile-response") || undefined, ip);
  if (turnstileError) return { status: "error", message: turnstileError };

  if (!isSupabaseConfigured) {
    return { status: "error", message: "Reviews cannot be saved right now. Please try again later." };
  }

  // Link to the signed-in client (if any) so it shows under /account → Reviews.
  const user = await getCurrentUser().catch(() => null);

  const { error } = await createSupabaseAdminClient().from("testimonials").insert({
    submitted_by: user?.id ?? null,
    author_name: data.name,
    author_company: data.company || null,
    author_role: data.role || null,
    rating: data.rating,
    title: data.title,
    review_text: data.reviewText,
    quote: data.reviewText.slice(0, 1000),
    is_verified: false,
    is_public: false,
    is_active: true,
    status: "draft",
  });
  if (error) return { status: "error", message: "Your review could not be saved right now." };

  return {
    status: "success",
    message: "Thank you! Your review was received and will appear after our team verifies it.",
  };
}
