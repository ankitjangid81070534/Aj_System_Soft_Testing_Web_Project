import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * Public agreement readers. The anon client + RLS guarantee only active
 * agreements with non-draft versions are visible here.
 */

export const SERVICE_AGREEMENT_SLUG = "service-agreement";

export const AGREEMENT_CONSENT_TEXT =
  "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.";

export const LAWYER_REVIEW_NOTE =
  "Have this agreement reviewed by a qualified local lawyer before relying on it as a binding contract.";

export type PublicAgreementVersion = {
  agreementId: string;
  agreementTitle: string;
  agreementSlug: string;
  agreementType: string;
  versionId: string;
  versionNumber: number;
  title: string;
  body: string;
  checksum: string | null;
  effectiveFrom: string | null;
  updatedAt: string;
};

type Row = Record<string, unknown>;
const text = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

/** Current published version of the active Service Agreement (or null). */
export const getCurrentServiceAgreement = unstable_cache(
  async (): Promise<PublicAgreementVersion | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const supabase = createSupabasePublicClient();
      const { data: agreements, error } = await supabase
        .from("agreements")
        .select("id, title, slug, agreement_type, current_version_id, is_active")
        .eq("slug", SERVICE_AGREEMENT_SLUG)
        .eq("is_active", true)
        .limit(1);
      const agreement = (agreements as Row[] | null)?.[0];
      if (error || !agreement) return null;
      const versionId = text(agreement.current_version_id);
      if (!versionId) return null;
      const { data: versions, error: versionError } = await supabase
        .from("agreement_versions")
        .select("id, version_number, title, body, checksum, effective_from, updated_at")
        .eq("id", versionId)
        .eq("is_draft", false)
        .limit(1);
      const version = (versions as Row[] | null)?.[0];
      if (versionError || !version) return null;
      return {
        agreementId: String(agreement.id),
        agreementTitle: text(agreement.title) ?? "Service Agreement",
        agreementSlug: SERVICE_AGREEMENT_SLUG,
        agreementType: text(agreement.agreement_type) ?? "service",
        versionId: String(version.id),
        versionNumber: Number(version.version_number ?? 1),
        title: text(version.title) ?? text(agreement.title) ?? "Service Agreement",
        body: text(version.body) ?? "",
        checksum: text(version.checksum),
        effectiveFrom: text(version.effective_from),
        updatedAt: text(version.updated_at) ?? new Date(0).toISOString(),
      };
    } catch {
      return null;
    }
  },
  ["service-agreement-current"],
  { tags: ["agreements"], revalidate: 300 },
);

export function formatVersion(version: number): string {
  return `v${version}`;
}
