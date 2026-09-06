import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validation/leads";

export type LeadKind = "quotes" | "messages" | "appointments";

export const LEAD_KINDS: { kind: LeadKind; label: string; table: string }[] = [
  { kind: "quotes", label: "Quote requests", table: "quote_requests" },
  { kind: "messages", label: "Messages", table: "contact_submissions" },
  { kind: "appointments", label: "Consultations", table: "appointment_requests" },
];

export function isLeadKind(value: string): value is LeadKind {
  return LEAD_KINDS.some((entry) => entry.kind === value);
}

export type LeadTable = "quote_requests" | "contact_submissions" | "appointment_requests";

export function leadTable(kind: LeadKind): LeadTable {
  return (LEAD_KINDS.find((entry) => entry.kind === kind)?.table ?? "quote_requests") as LeadTable;
}

export type LeadRow = {
  id: string;
  title: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  internal_notes: string | null;
  detail: Record<string, string | null>;
};

function mapRow(kind: LeadKind, row: Record<string, unknown>): LeadRow {
  const statusValue = typeof row.status === "string" ? row.status : "new";
  const status = (LEAD_STATUSES as readonly string[]).includes(statusValue)
    ? (statusValue as LeadStatus)
    : "new";
  const asText = (value: unknown): string | null =>
    typeof value === "string" && value ? value : null;

  if (kind === "quotes") {
    return {
      id: String(row.id),
      title: asText(row.full_name) ?? "Unknown",
      email: asText(row.email) ?? "",
      phone: asText(row.phone),
      status,
      created_at: asText(row.created_at) ?? "",
      updated_at: asText(row.updated_at) ?? "",
      assigned_to: asText(row.assigned_to),
      internal_notes: asText(row.internal_notes),
      detail: {
        Company: asText(row.company),
        WhatsApp: asText(row.whatsapp),
        Location: asText(row.location),
        "Project type": asText(row.project_type),
        Platform: asText(row.platform),
        Industry: asText(row.industry),
        "Budget range": asText(row.budget_range),
        Timeline: asText(row.timeline),
        Requirements: asText(row.requirements),
        Attachment: asText(row.attachment_url),
        "Preferred contact": asText(row.preferred_contact),
        Consent: row.consent === true ? "Given" : row.consent === false ? "Missing" : null,
      },
    };
  }
  if (kind === "appointments") {
    return {
      id: String(row.id),
      title: asText(row.name) ?? "Unknown",
      email: asText(row.email) ?? "",
      phone: asText(row.phone),
      status,
      created_at: asText(row.created_at) ?? "",
      updated_at: asText(row.updated_at) ?? "",
      assigned_to: null,
      internal_notes: asText(row.internal_notes),
      detail: {
        "Preferred date": asText(row.preferred_date),
        "Preferred time": asText(row.preferred_time),
        Topic: asText(row.topic),
        Message: asText(row.message),
      },
    };
  }
  return {
    id: String(row.id),
    title: asText(row.name) ?? "Unknown",
    email: asText(row.email) ?? "",
    phone: asText(row.phone),
    status,
    created_at: asText(row.created_at) ?? "",
    updated_at: asText(row.updated_at) ?? "",
    assigned_to: asText(row.assigned_to),
    internal_notes: asText(row.internal_notes),
    detail: {
      Company: asText(row.company),
      Message: asText(row.message),
      "Source page": asText(row.source_page),
    },
  };
}

function searchableText(kind: LeadKind, row: Record<string, unknown>): string {
  const values =
    kind === "quotes"
      ? [row.full_name, row.email, row.company, row.requirements]
      : kind === "appointments"
        ? [row.name, row.email, row.topic, row.message]
        : [row.name, row.email, row.company, row.message];
  return values
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

export type LeadListResult = {
  rows: LeadRow[];
  total: number;
  statusCounts: Record<string, number>;
};

/** Admin lead inbox listing: status filter, text search, newest first. */
export const listLeads = cache(
  async (kind: LeadKind, filters: { status?: string; q?: string }): Promise<LeadListResult> => {
    if (!isSupabaseConfigured) return { rows: [], total: 0, statusCounts: {} };
    try {
      const actor = await getCurrentUser();
      if (!actor || !can(actor.role, "leads:read")) {
        return { rows: [], total: 0, statusCounts: {} };
      }
      const supabase = createSupabaseAdminClient();
      const table = leadTable(kind);

      let query = supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filters.status && (LEAD_STATUSES as readonly string[]).includes(filters.status)) {
        query = query.eq("status", filters.status as LeadStatus);
      }
      const { data, error } = await query;
      if (error || !data) return { rows: [], total: 0, statusCounts: {} };

      const statusCounts: Record<string, number> = {};
      for (const row of data) {
        const statusValue = typeof row.status === "string" ? row.status : "new";
        statusCounts[statusValue] = (statusCounts[statusValue] ?? 0) + 1;
      }

      const q = filters.q?.trim().toLowerCase();
      const filtered = q ? data.filter((row) => searchableText(kind, row).includes(q)) : data;

      return {
        rows: filtered.map((row) => mapRow(kind, row)),
        total: filtered.length,
        statusCounts,
      };
    } catch {
      return { rows: [], total: 0, statusCounts: {} };
    }
  },
);

export const getLead = cache(async (kind: LeadKind, id: string): Promise<LeadRow | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    const actor = await getCurrentUser();
    if (!actor || !can(actor.role, "leads:read")) return null;
    const supabase = createSupabaseAdminClient();
    const { data: rows, error } = await supabase
      .from(leadTable(kind))
      .select("*")
      .eq("id", id)
      .limit(1);
    if (error || !rows || rows.length === 0) return null;
    return mapRow(kind, rows[0]);
  } catch {
    return null;
  }
});

export type StaffOption = { id: string; label: string };

/** Assignment options: admins and super admins (RLS-gated read). */
export const getStaffOptions = cache(async (): Promise<StaffOption[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const actor = await getCurrentUser();
    if (!actor || !can(actor.role, "leads:manage")) return [];
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["admin", "super_admin"])
      .order("full_name");
    return (data ?? []).map((row) => ({
      id: row.id,
      label: row.full_name ? `${row.full_name} (${row.email})` : row.email,
    }));
  } catch {
    return [];
  }
});

/** Attachment download link for staff (signed URL, 30 minutes). */
export async function getAttachmentSignedUrl(path: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const actor = await getCurrentUser();
    if (!actor || !can(actor.role, "leads:read")) return null;
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.storage.from("lead-attachments").createSignedUrl(path, 1800);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
