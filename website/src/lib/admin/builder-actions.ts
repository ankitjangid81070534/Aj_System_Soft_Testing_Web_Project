"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { galleryContentSchema } from "@/lib/validation/sections";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";

const idSchema = z.string().uuid();
const directionSchema = z.enum(["up", "down"]);

/**
 * Home-builder section actions. Section content itself is edited on the
 * section page (validated JSONB — no raw HTML/JS); these actions handle the
 * structure: visibility, ordering, publish state.
 */
async function authorize(): Promise<{ ok: true; userId: string } | { ok: false }> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "content:write")) return { ok: false };
  return { ok: true, userId: user.id };
}

function builderRedirect(path: string, kind: "notice" | "error", message: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${new URLSearchParams({ [kind]: message }).toString()}`);
}

function refreshHomeBuilder(): void {
  // A successful database write must never surface as a failed save because a
  // cache refresh had a transient problem (same contract as refreshResource).
  try {
    revalidatePath("/ajadmin/home");
    updateTag("home-sections");
    revalidatePath("/");
  } catch (error) {
    console.error("[admin] home builder cache refresh failed:", error);
  }
}

export async function toggleSectionVisibilityAction(formData: FormData): Promise<void> {
  const auth = await authorize();
  if (!auth.ok) return;
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;

  const admin = createSupabaseAdminLooseClient();
  const { data } = await admin
    .from("page_sections")
    .select("is_visible")
    .eq("id", id.data)
    .limit(1);
  if (!data || data.length === 0) return;
  const { error } = await admin
    .from("page_sections")
    .update({ is_visible: !data[0].is_visible, updated_by: auth.userId })
    .eq("id", id.data);
  if (error) console.error("[admin] section visibility failed", error.message);
  refreshHomeBuilder();
}

export async function reorderSectionAction(formData: FormData): Promise<void> {
  const auth = await authorize();
  if (!auth.ok) return;
  const id = idSchema.safeParse(formData.get("id"));
  const direction = directionSchema.safeParse(formData.get("direction"));
  if (!id.success || !direction.success) return;

  const admin = createSupabaseAdminLooseClient();
  const { data: all } = await admin
    .from("page_sections")
    .select("id, sort_order")
    .eq("page", "home")
    .order("sort_order", { ascending: true });
  if (!all || all.length < 2) return;

  const rows = all as { id: string; sort_order: number }[];
  const index = rows.findIndex((row) => row.id === id.data);
  const swapWith = direction.data === "up" ? rows[index - 1] : rows[index + 1];
  if (index < 0 || !swapWith) return;

  const { error: firstError } = await admin
    .from("page_sections")
    .update({ sort_order: swapWith.sort_order, updated_by: auth.userId })
    .eq("id", id.data);
  const { error: secondError } = await admin
    .from("page_sections")
    .update({ sort_order: rows[index].sort_order, updated_by: auth.userId })
    .eq("id", swapWith.id);
  if (firstError || secondError) {
    console.error("[admin] section reorder failed", firstError?.message ?? secondError?.message);
  }
  refreshHomeBuilder();
}

export async function setSectionStatusAction(formData: FormData): Promise<void> {
  const auth = await authorize();
  if (!auth.ok) return;
  const id = idSchema.safeParse(formData.get("id"));
  const status = z.enum(["draft", "published"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin
    .from("page_sections")
    .update({ status: status.data, updated_by: auth.userId })
    .eq("id", id.data);
  if (error) console.error("[admin] section status failed", error.message);
  refreshHomeBuilder();
}

const SECTION_TYPES = [
  "hero",
  "trust_strip",
  "services_overview",
  "platforms",
  "featured_projects",
  "process",
  "industries",
  "tech_capabilities",
  "why_us",
  "testimonials",
  "team",
  "gallery",
  "faq",
  "cta",
] as const;

const sectionTypeSchema = z.enum(SECTION_TYPES);

/** Validate section content per type. Only types with a registered schema
 * accept non-empty content; everything must parse before it reaches the DB. */
function validateSectionContent(sectionType: string, content: unknown): string | null {
  if (sectionType === "gallery") {
    const parsed = galleryContentSchema.safeParse(content);
    return parsed.success
      ? null
      : "Gallery content must be { images: [{ url, alt?, caption? }], headline? } with 1-24 images.";
  }
  // Other section types: JSON object with no schema registered yet (Phase 9+
  // adds typed editors as the public site consumes them).
  return content !== null && typeof content === "object" && !Array.isArray(content)
    ? null
    : "Content must be a JSON object.";
}

export async function saveSectionAction(formData: FormData): Promise<void> {
  const auth = await authorize();
  if (!auth.ok) builderRedirect("/ajadmin/home", "error", "Your session cannot edit sections.");

  const id = idSchema.safeParse(formData.get("id"));
  const status = z.enum(["draft", "published"]).safeParse(formData.get("status"));
  const variant = z
    .enum(["default", "centered", "split"])
    .safeParse(formData.get("variant") ?? "default");
  const accent = z.enum(["brand", "ink", "slate"]).safeParse(formData.get("accent") ?? "brand");
  const sortOrder = z.coerce
    .number()
    .int()
    .min(0)
    .max(999)
    .safeParse(formData.get("sort_order") ?? 0);
  const rawContent = String(formData.get("content") ?? "{}");

  const editPath = id.success ? `/ajadmin/home/${id.data}` : "/ajadmin/home";
  if (!id.success || !status.success || !variant.success || !accent.success || !sortOrder.success) {
    builderRedirect(editPath, "error", "Check the section status, layout and sort order.");
  }

  let content: unknown;
  try {
    content = JSON.parse(rawContent);
  } catch {
    builderRedirect(editPath, "error", "Section content is not valid JSON.");
  }
  const sectionClient = createSupabaseAdminLooseClient();
  const { data: rows, error: readError } = await sectionClient
    .from("page_sections")
    .select("section_type")
    .eq("id", id.data)
    .limit(1);
  const sectionType = rows?.[0]?.section_type;
  if (readError || typeof sectionType !== "string") {
    builderRedirect(editPath, "error", "This section could not be loaded for saving.");
  }
  const contentError = validateSectionContent(sectionType, content);
  if (contentError) builderRedirect(editPath, "error", contentError);

  const admin = createSupabaseAdminLooseClient();
  const { data: saved, error } = await admin
    .from("page_sections")
    .update({
      content,
      status: status.data,
      variant: variant.data,
      accent: accent.data,
      sort_order: sortOrder.data,
      updated_by: auth.userId,
    })
    .eq("id", id.data)
    .select("id")
    .limit(1);
  if (error || !saved || saved.length === 0) {
    console.error("[admin] section save failed", {
      code: error?.code ?? "no-row",
      message: error?.message ?? "The write returned no saved row.",
    });
    builderRedirect(
      editPath,
      "error",
      "The section could not be saved. Check the latest migration.",
    );
  }
  refreshHomeBuilder();
  builderRedirect(editPath, "notice", "Section saved successfully.");
}

export async function createSectionAction(formData: FormData): Promise<void> {
  const auth = await authorize();
  if (!auth.ok) builderRedirect("/ajadmin/home", "error", "Your session cannot create sections.");
  const sectionType = sectionTypeSchema.safeParse(formData.get("section_type"));
  if (!sectionType.success)
    builderRedirect("/ajadmin/home/new", "error", "Choose a valid section type.");

  const admin = createSupabaseAdminLooseClient();
  const { data: last } = await admin
    .from("page_sections")
    .select("sort_order")
    .eq("page", "home")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSort =
    (((last?.[0] as Record<string, unknown> | undefined)?.sort_order as number) ?? 0) + 10;

  const { error } = await admin.from("page_sections").insert({
    page: "home",
    section_type: sectionType.data,
    content: {},
    status: "draft",
    is_visible: true,
    sort_order: nextSort,
    created_by: auth.userId,
    updated_by: auth.userId,
  });
  if (error) {
    console.error("[admin] section create failed", { code: error.code, message: error.message });
    builderRedirect("/ajadmin/home/new", "error", "The section could not be created.");
  }
  refreshHomeBuilder();
  builderRedirect("/ajadmin/home", "notice", "Section created successfully.");
}
