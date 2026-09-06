import "server-only";

import { headers } from "next/headers";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { clientIpFrom } from "@/lib/rate-limit";
import { buildPdf, markdownToBlocks, type PdfBlock } from "@/lib/pdf/simple-pdf";
import {
  AGREEMENT_CONSENT_TEXT,
  getCurrentServiceAgreement,
  type PublicAgreementVersion,
} from "@/lib/agreements/data";

/**
 * Server-side acceptance recording. Called from the contact / quote / sign-up
 * actions after the lead or account has been created. Writes go through the
 * service role (RLS has no anon/authenticated insert policy on purpose so
 * evidence rows cannot be forged from a browser).
 *
 * Failures are logged and swallowed: the lead/account is already saved, and a
 * missing evidence row must never make a successful submission look failed.
 */

export type AcceptanceContext = "signup" | "contact" | "quote" | "account" | "admin" | "other";

export type AcceptanceInput = {
  context: AcceptanceContext;
  userId?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  relatedTable?: "contact_submissions" | "quote_requests" | "appointment_requests" | null;
  relatedId?: string | null;
};

async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function acceptanceEvidenceBlocks(
  agreement: PublicAgreementVersion,
  input: AcceptanceInput & { acceptanceId: string; acceptedAt: string },
): PdfBlock[] {
  const acceptedAt = new Date(input.acceptedAt);
  return [
    { kind: "title", text: "AJ System Soft Technology" },
    { kind: "subtitle", text: `${agreement.title} — Acceptance Record` },
    { kind: "rule" },
    { kind: "meta", label: "Agreement version", value: `v${agreement.versionNumber}` },
    {
      kind: "meta",
      label: "Effective from",
      value: agreement.effectiveFrom
        ? new Date(agreement.effectiveFrom).toISOString().slice(0, 10)
        : "See agreement",
    },
    { kind: "meta", label: "Reference ID", value: input.acceptanceId },
    {
      kind: "meta",
      label: "Accepted on",
      value: `${acceptedAt.toISOString().replace("T", " ").slice(0, 19)} UTC`,
    },
    { kind: "meta", label: "Context", value: input.context },
    { kind: "meta", label: "Client name", value: input.fullName || "—" },
    { kind: "meta", label: "Client email", value: input.email || "—" },
    { kind: "meta", label: "Client phone", value: input.phone || "—" },
    { kind: "meta", label: "Consent statement", value: AGREEMENT_CONSENT_TEXT },
    { kind: "meta", label: "Document checksum (SHA-256)", value: agreement.checksum ?? "—" },
    { kind: "spacer", size: 12 },
    { kind: "rule" },
    ...markdownToBlocks(agreement.body),
  ];
}

export async function recordAgreementAcceptance(
  input: AcceptanceInput,
): Promise<{ acceptanceId: string; versionId: string } | null> {
  const agreement = await getCurrentServiceAgreement();
  if (!agreement) return null;

  let ipHash: string | null = null;
  let userAgent: string | null = null;
  try {
    const requestHeaders = await headers();
    ipHash = await sha256Hex(`ajs-acceptance:${clientIpFrom(requestHeaders)}`);
    userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? null;
  } catch {
    // headers() unavailable (e.g. tests) — evidence still records the rest.
  }

  const admin = createSupabaseAdminLooseClient();
  const acceptedAt = new Date().toISOString();
  const { data, error } = await admin
    .from("agreement_acceptances")
    .insert({
      agreement_id: agreement.agreementId,
      version_id: agreement.versionId,
      user_id: input.userId ?? null,
      guest_identifier: input.userId ? null : (input.email?.toLowerCase() ?? null),
      accepted_at: acceptedAt,
      context: input.context,
      full_name: input.fullName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      related_table: input.relatedTable ?? null,
      related_id: input.relatedId ?? null,
      ip_hash: ipHash,
      user_agent: userAgent,
      consent_text: AGREEMENT_CONSENT_TEXT,
    })
    .select("id")
    .limit(1);

  const acceptanceId = data?.[0]?.id ? String(data[0].id) : null;
  if (error || !acceptanceId) {
    console.error("[agreements] acceptance insert failed", {
      code: error?.code,
      message: error?.message,
    });
    return null;
  }

  // Evidence PDF — best effort, stored privately; never blocks the flow.
  try {
    const pdf = buildPdf(
      acceptanceEvidenceBlocks(agreement, { ...input, acceptanceId, acceptedAt }),
      `AJ System Soft Technology — Agreement v${agreement.versionNumber} — Ref ${acceptanceId}`,
    );
    const path = `acceptances/${acceptedAt.slice(0, 10)}/${acceptanceId}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("agreements")
      .upload(path, pdf, { contentType: "application/pdf", upsert: false });
    if (uploadError) {
      console.error("[agreements] evidence upload failed", { message: uploadError.message });
    } else {
      const evidenceHash = await sha256Hex(pdf);
      await admin
        .from("agreement_acceptances")
        .update({ evidence_pdf_path: path, evidence_hash: evidenceHash })
        .eq("id", acceptanceId);
    }
  } catch (pdfError) {
    console.error("[agreements] evidence generation failed", {
      message: pdfError instanceof Error ? pdfError.message : "unknown",
    });
  }

  // Link the lead row to the accepted version (columns added in 0016).
  if (input.relatedTable && input.relatedId && input.relatedTable !== "appointment_requests") {
    const { error: linkError } = await admin
      .from(input.relatedTable)
      .update({ agreement_version_id: agreement.versionId, agreement_accepted_at: acceptedAt })
      .eq("id", input.relatedId);
    if (linkError) {
      console.error("[agreements] lead link failed", { message: linkError.message });
    }
  }

  return { acceptanceId, versionId: agreement.versionId };
}

/** Signed URL for an acceptance/version PDF stored in the private bucket. */
export async function signedAgreementFileUrl(path: string, expiresIn = 1800): Promise<string | null> {
  try {
    const admin = createSupabaseAdminLooseClient();
    const { data, error } = await admin.storage.from("agreements").createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export { sha256Hex };
