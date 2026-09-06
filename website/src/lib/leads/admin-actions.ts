"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isLeadKind } from "@/lib/data/admin-leads";
import { leadStatusSchema } from "@/lib/validation/leads";
import {
  authFailure,
  databaseFailureForCode,
  validationFailure,
  type AdminMutationState,
} from "@/lib/admin/mutation-result";

export type LeadUpdateState = AdminMutationState;

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function updateLeadAction(
  _prev: LeadUpdateState,
  formData: FormData,
): Promise<LeadUpdateState> {
  const user = await getCurrentUser();
  if (!user) return authFailure("UNAUTHORIZED", "Session expired — sign in again.");
  if (!can(user.role, "leads:manage")) {
    return authFailure("FORBIDDEN", "Your role cannot manage leads.");
  }

  const kind = formString(formData, "kind");
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  const notes = formString(formData, "notes") ?? "";
  const assignedTo = formString(formData, "assignedTo") ?? "";

  if (!kind || !isLeadKind(kind)) return validationFailure("Unknown lead type.");
  if (!id) return validationFailure("Missing lead id.");
  const statusCheck = leadStatusSchema.safeParse(status);
  if (!statusCheck.success) return validationFailure("Unknown status.");

  const supabase = await createSupabaseServerClient();
  // Explicit branches keep the query builder fully typed per table.
  // appointment_requests has no assignment column.
  let data: { id: string }[] | null = null;
  let error: { code?: string; message: string } | null = null;
  if (kind === "quotes") {
    ({ data, error } = await supabase
      .from("quote_requests")
      .update({
        status: statusCheck.data,
        internal_notes: notes.trim() || null,
        assigned_to: assignedTo || null,
      })
      .eq("id", id)
      .select("id")
      .limit(1));
  } else if (kind === "messages") {
    ({ data, error } = await supabase
      .from("contact_submissions")
      .update({
        status: statusCheck.data,
        internal_notes: notes.trim() || null,
        assigned_to: assignedTo || null,
      })
      .eq("id", id)
      .select("id")
      .limit(1));
  } else {
    ({ data, error } = await supabase
      .from("appointment_requests")
      .update({ status: statusCheck.data, internal_notes: notes.trim() || null })
      .eq("id", id)
      .select("id")
      .limit(1));
  }

  if (error || !data || data.length === 0) {
    console.error("[admin] lead update failed", {
      code: error?.code ?? "no-row",
      message: error?.message ?? "The update returned no row.",
      kind,
      rowId: id,
      actorId: user.id,
    });
    return databaseFailureForCode(error?.code);
  }

  revalidatePath("/ajadmin/leads");
  revalidatePath(`/ajadmin/leads/${kind}/${id}`);
  return { ok: true, message: "Lead updated." };
}
