"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { sha256Hex } from "@/lib/agreements/acceptance";
import { buildPdf, markdownToBlocks } from "@/lib/pdf/simple-pdf";

/**
 * Versioned agreement management. Historical integrity is enforced by the
 * database (0016 immutability trigger): a version with recorded acceptances
 * can never be edited or deleted, so admins can only ADD versions and switch
 * the active pointer.
 */

const idSchema = z.string().uuid();
const AGREEMENT_TYPES = ["service", "privacy", "terms", "custom"] as const;

function agreementsRedirect(kind: "notice" | "error", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/ajadmin/agreements?${params.toString()}`);
}

async function writeAudit(row: {
  actor_id: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  summary: string;
}): Promise<void> {
  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin.from("audit_logs").insert(row);
  if (error) {
    console.error("[admin] audit log write failed", {
      action: row.action,
      code: error.code,
      message: error.message,
    });
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function refreshAgreements(): void {
  try {
    updateTag("agreements");
    revalidatePath("/ajadmin/agreements");
    revalidatePath("/service-agreement");
  } catch (error) {
    console.error("[admin] agreements cache refresh failed", {
      message: error instanceof Error ? error.message : "Unknown refresh error",
    });
  }
}

export async function createAgreementAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "settings:write")) {
    agreementsRedirect("error", "Only admins can create agreements.");
  }

  const title = z.string().trim().min(3).max(200).safeParse(formData.get("title"));
  const type = z.enum(AGREEMENT_TYPES).safeParse(formData.get("agreement_type") ?? "service");
  if (!title.success) agreementsRedirect("error", "Agreement title needs 3–200 characters.");
  if (!type.success) agreementsRedirect("error", "Choose a valid agreement type.");

  const slugBase = slugify(String(formData.get("slug") ?? "") || title.data);
  const admin = createSupabaseAdminLooseClient();

  let slug = slugBase;
  for (let suffix = 2; suffix < 50; suffix += 1) {
    const { data } = await admin
      .from("agreements")
      .select("id")
      .eq("slug", slug)
      .limit(1);
    if (!data || data.length === 0) break;
    slug = `${slugBase}-${suffix}`;
  }

  const { data: created, error } = await admin
    .from("agreements")
    .insert({
      title: title.data,
      slug,
      agreement_type: type.data,
      is_active: false,
      created_by: actor.id,
      updated_by: actor.id,
    })
    .select("id")
    .limit(1);

  if (error || !created || created.length === 0) {
    console.error("[admin] agreement create failed", { code: error?.code, message: error?.message });
    agreementsRedirect("error", "The agreement could not be created.");
  }

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "agreement.created",
    entity: "agreements",
    entity_id: String(created[0].id),
    summary: `Created agreement "${title.data}" (${slug})`,
  });
  refreshAgreements();
  agreementsRedirect("notice", "Agreement created. Add version 1 to publish its text.");
}

export async function createAgreementVersionAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "settings:write")) {
    agreementsRedirect("error", "Only admins can add agreement versions.");
  }

  const agreementId = idSchema.safeParse(formData.get("agreement_id"));
  const title = z.string().trim().min(3).max(200).safeParse(formData.get("title"));
  const body = z.string().trim().min(50).max(200000).safeParse(formData.get("body"));
  const changeNote = z.string().trim().max(500).safeParse(formData.get("change_note") ?? "");
  if (!agreementId.success) agreementsRedirect("error", "Unknown agreement.");
  if (!title.success) agreementsRedirect("error", "Version title needs 3–200 characters.");
  if (!body.success) {
    agreementsRedirect("error", "The agreement text needs at least 50 characters.");
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: agreement } = await admin
    .from("agreements")
    .select("id, title, slug")
    .eq("id", agreementId.data)
    .limit(1);
  const row = (agreement ?? [])[0] as Record<string, unknown> | undefined;
  if (!row) agreementsRedirect("error", "The agreement no longer exists.");

  const { data: lastVersion } = await admin
    .from("agreement_versions")
    .select("version_number")
    .eq("agreement_id", agreementId.data)
    .order("version_number", { ascending: false })
    .limit(1);
  const nextNumber =
    Number(((lastVersion ?? [])[0] as Record<string, unknown> | undefined)?.version_number ?? 0) + 1;

  const checksum = await sha256Hex(body.data);
  const { error } = await admin.from("agreement_versions").insert({
    agreement_id: agreementId.data,
    version_number: nextNumber,
    title: title.data,
    body: body.data,
    plain_text: body.data.replace(/[#*_`>]+/g, ""),
    checksum,
    is_draft: true,
    change_note: changeNote.success && changeNote.data !== "" ? changeNote.data : null,
    created_by: actor.id,
  });

  if (error) {
    console.error("[admin] agreement version create failed", {
      code: error.code,
      message: error.message,
    });
    agreementsRedirect("error", `Version could not be saved: ${error.message}`);
  }

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "agreement.version_created",
    entity: "agreement_versions",
    entity_id: String(row.id),
    summary: `Draft v${nextNumber} created for "${String(row.title)}"`,
  });
  refreshAgreements();
  agreementsRedirect("notice", `Draft version ${nextNumber} created. Review it, then activate.`);
}

export async function activateAgreementVersionAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "settings:write")) {
    agreementsRedirect("error", "Only admins can activate agreement versions.");
  }

  const versionId = idSchema.safeParse(formData.get("version_id"));
  if (!versionId.success) agreementsRedirect("error", "Unknown version.");

  const admin = createSupabaseAdminLooseClient();
  const { data: version } = await admin
    .from("agreement_versions")
    .select("id, agreement_id, version_number, is_draft, effective_from")
    .eq("id", versionId.data)
    .limit(1);
  const versionRow = (version ?? [])[0] as Record<string, unknown> | undefined;
  if (!versionRow) agreementsRedirect("error", "The version no longer exists.");

  const now = new Date().toISOString();
  const { error: versionError } = await admin
    .from("agreement_versions")
    .update({
      is_draft: false,
      effective_from: versionRow.effective_from ?? now,
      updated_at: now,
    })
    .eq("id", versionId.data);
  if (versionError) {
    agreementsRedirect("error", `Version could not be activated: ${versionError.message}`);
  }

  const { error: agreementError } = await admin
    .from("agreements")
    .update({ is_active: true, current_version_id: versionRow.id, updated_at: now })
    .eq("id", versionRow.agreement_id);
  if (agreementError) {
    agreementsRedirect("error", `Agreement could not be updated: ${agreementError.message}`);
  }

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "agreement.version_activated",
    entity: "agreements",
    entity_id: String(versionRow.agreement_id),
    summary: `Version v${versionRow.version_number} activated`,
  });
  refreshAgreements();
  agreementsRedirect("notice", `Version v${versionRow.version_number} is now live.`);
}

export async function generateAgreementVersionPdfAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "settings:write")) {
    agreementsRedirect("error", "Only admins can generate agreement PDFs.");
  }

  const versionId = idSchema.safeParse(formData.get("version_id"));
  if (!versionId.success) agreementsRedirect("error", "Unknown version.");

  const admin = createSupabaseAdminLooseClient();
  const { data: version } = await admin
    .from("agreement_versions")
    .select("id, agreement_id, version_number, title, body, effective_from")
    .eq("id", versionId.data)
    .limit(1);
  const versionRow = (version ?? [])[0] as Record<string, unknown> | undefined;
  if (!versionRow) agreementsRedirect("error", "The version no longer exists.");

  const { data: agreement } = await admin
    .from("agreements")
    .select("title")
    .eq("id", versionRow.agreement_id)
    .limit(1);
  const agreementTitle = String((agreement ?? [])[0]?.title ?? "Agreement");

  try {
    const effectiveFrom = versionRow.effective_from
      ? new Date(String(versionRow.effective_from)).toISOString().slice(0, 10)
      : "Draft — not yet effective";
    const pdf = buildPdf(
      [
        { kind: "title", text: "AJ System Soft Technology" },
        { kind: "subtitle", text: agreementTitle },
        { kind: "rule" },
        { kind: "meta", label: "Version", value: `v${versionRow.version_number}` },
        { kind: "meta", label: "Effective from", value: effectiveFrom },
        { kind: "spacer", size: 12 },
        ...markdownToBlocks(String(versionRow.body)),
      ],
      `${agreementTitle} — v${versionRow.version_number}`,
    );
    const path = `versions/${String(versionRow.agreement_id)}/v${versionRow.version_number}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("agreements")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      agreementsRedirect("error", `PDF upload failed: ${uploadError.message}`);
    }
    const { error: updateError } = await admin
      .from("agreement_versions")
      .update({ pdf_path: path })
      .eq("id", versionRow.id);
    if (updateError) {
      agreementsRedirect("error", `PDF path could not be saved: ${updateError.message}`);
    }
  } catch (pdfError) {
    console.error("[admin] agreement PDF generation failed", {
      message: pdfError instanceof Error ? pdfError.message : "unknown",
    });
    agreementsRedirect("error", "The PDF could not be generated.");
  }

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "agreement.version_pdf_generated",
    entity: "agreement_versions",
    entity_id: String(versionRow.id),
    summary: `PDF generated for v${versionRow.version_number}`,
  });
  refreshAgreements();
  agreementsRedirect("notice", `PDF stored for v${versionRow.version_number}.`);
}

export async function archiveAgreementAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor || !can(actor.role, "settings:write")) {
    agreementsRedirect("error", "Only admins can archive agreements.");
  }

  const agreementId = idSchema.safeParse(formData.get("agreement_id"));
  if (!agreementId.success) agreementsRedirect("error", "Unknown agreement.");

  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin
    .from("agreements")
    .update({ is_active: false })
    .eq("id", agreementId.data);
  if (error) {
    agreementsRedirect("error", `Agreement could not be archived: ${error.message}`);
  }

  await writeAudit({
    actor_id: actor.id,
    actor_email: actor.email,
    action: "agreement.archived",
    entity: "agreements",
    entity_id: agreementId.data,
    summary: "Agreement archived (no longer shown publicly)",
  });
  refreshAgreements();
  agreementsRedirect("notice", "Agreement archived — it no longer appears on the public site.");
}
