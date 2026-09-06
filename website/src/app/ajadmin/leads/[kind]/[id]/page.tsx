import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { LeadEditForm } from "@/components/admin/LeadEditForm";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import {
  getAttachmentSignedUrl,
  getLead,
  getStaffOptions,
  isLeadKind,
  LEAD_KINDS,
} from "@/lib/data/admin-leads";

// Per-request auth; never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Lead" },
  robots: { index: false, follow: false },
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!isLeadKind(kind)) notFound();
  const kindMeta = LEAD_KINDS.find((entry) => entry.kind === kind);

  const user = await getCurrentUser();
  if (!user) {
    return (
      <section>
        <p className="text-sm text-ink-muted">Session expired — sign in again.</p>
      </section>
    );
  }
  if (!can(user.role, "leads:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role does not include lead access.
        </p>
      </section>
    );
  }

  const lead = await getLead(kind, id);
  if (!lead) notFound();
  const staffOptions = await getStaffOptions();

  const attachmentPath = lead.detail.Attachment;
  const attachmentUrl = attachmentPath ? await getAttachmentSignedUrl(attachmentPath) : null;

  return (
    <section>
      <Link
        href={`/ajadmin/leads?tab=${kind}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink focus-ring rounded-sm"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to {kindMeta?.label ?? "leads"}
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-ink">{lead.title}</h1>
              <p className="mt-0.5 text-sm text-ink-muted">{lead.email}</p>
            </div>
            <StatusPill status={lead.status} />
          </div>

          <dl className="mt-5 divide-y divide-line">
            {Object.entries(lead.detail)
              .filter(([, value]) => value !== null)
              .map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {label}
                  </dt>
                  <dd className="whitespace-pre-wrap text-sm text-ink-soft">{value}</dd>
                </div>
              ))}
          </dl>

          {attachmentPath ? (
            <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Attachment
              </p>
              {attachmentUrl ? (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 focus-ring rounded-sm"
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download (signed link, 30 min)
                </a>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">
                  Attachment stored privately ({attachmentPath.split("/").pop()}) — available to
                  admins only.
                </p>
              )}
            </div>
          ) : null}

          <p className="mt-5 border-t border-line pt-4 text-xs text-ink-muted">
            Received{" "}
            <time dateTime={lead.created_at}>
              {new Date(lead.created_at).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </time>
            {lead.updated_at && lead.updated_at !== lead.created_at ? (
              <>
                {" · "}updated{" "}
                <time dateTime={lead.updated_at}>
                  {new Date(lead.updated_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </>
            ) : null}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1">
          <h2 className="text-base font-semibold tracking-tight text-ink">Manage</h2>
          <p className="mt-1 mb-4 text-sm text-ink-muted">
            Pipeline status, assignment and internal notes.
          </p>
          <LeadEditForm
            kind={kind}
            id={lead.id}
            status={lead.status}
            notes={lead.internal_notes}
            assignedTo={lead.assigned_to}
            staffOptions={staffOptions}
          />
        </div>
      </div>
    </section>
  );
}
