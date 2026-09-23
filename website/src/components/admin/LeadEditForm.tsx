"use client";

import { useActionState } from "react";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { useKeepFormValues } from "@/components/admin/useKeepFormValues";
import { Button } from "@/components/ui/Button";
import { updateLeadAction, type LeadUpdateState } from "@/lib/leads/admin-actions";
import { LEAD_STATUSES } from "@/lib/validation/leads";

const initialState: LeadUpdateState = { ok: null };

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
};

export function LeadEditForm({
  kind,
  id,
  status,
  notes,
  assignedTo,
  staffOptions,
}: {
  kind: string;
  id: string;
  status: string;
  notes: string | null;
  assignedTo: string | null;
  staffOptions: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateLeadAction, initialState);
  const { onReset: keepValuesOnReset } = useKeepFormValues();

  return (
    <form action={formAction} aria-busy={pending} onReset={keepValuesOnReset} className="flex min-w-0 flex-col gap-4">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <Field label="Status" htmlFor="lead-status">
        <Select id="lead-status" name="status" defaultValue={status}>
          {LEAD_STATUSES.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option]}
            </option>
          ))}
        </Select>
      </Field>
      {staffOptions.length > 0 ? (
        <Field label="Assigned to (optional)" htmlFor="lead-assignee">
          <Select id="lead-assignee" name="assignedTo" defaultValue={assignedTo ?? ""}>
            <option value="">Unassigned</option>
            {staffOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <Field
        label="Internal notes"
        htmlFor="lead-notes"
        hint="Visible to staff only — never shown to the lead."
      >
        <Textarea
          id="lead-notes"
          name="notes"
          rows={5}
          defaultValue={notes ?? ""}
          maxLength={4000}
        />
      </Field>
      <AdminFeedback state={state} />
      <div>
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
