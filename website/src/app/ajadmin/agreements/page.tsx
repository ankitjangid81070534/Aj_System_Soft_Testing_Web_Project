import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { LAWYER_REVIEW_NOTE } from "@/lib/agreements/data";
import {
  activateAgreementVersionAction,
  archiveAgreementAction,
  createAgreementAction,
  createAgreementVersionAction,
  generateAgreementVersionPdfAction,
} from "@/lib/admin/agreement-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Agreements" },
  robots: { index: false, follow: false },
};

type AgreementRow = Record<string, unknown>;
type VersionRow = Record<string, unknown>;

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring";


export default async function AgreementsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "settings:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role ({user.role}) does not include agreement management access.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Agreements</h1>
        <p
          role="status"
          className="mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Supabase is not configured yet.
        </p>
      </section>
    );
  }

  const canManage = can(user.role, "settings:write");
  const admin = createSupabaseAdminLooseClient();

  const { data: agreementRows } = await admin
    .from("agreements")
    .select("id, title, slug, agreement_type, is_active, effective_from, current_version_id, created_at")
    .order("created_at", { ascending: true });
  const agreements = (agreementRows ?? []) as unknown as AgreementRow[];

  const { data: versionRows } = await admin
    .from("agreement_versions")
    .select("id, agreement_id, version_number, title, is_draft, effective_from, checksum, pdf_path, change_note, created_at")
    .order("version_number", { ascending: false });
  const versions = (versionRows ?? []) as unknown as VersionRow[];

  const { data: acceptanceRows } = await admin
    .from("agreement_acceptances")
    .select("version_id");
  const acceptanceCounts = new Map<string, number>();
  for (const row of acceptanceRows ?? []) {
    const key = String((row as Record<string, unknown>).version_id);
    acceptanceCounts.set(key, (acceptanceCounts.get(key) ?? 0) + 1);
  }

  const versionsByAgreement = new Map<string, VersionRow[]>();
  for (const version of versions) {
    const key = String(version.agreement_id);
    versionsByAgreement.set(key, [...(versionsByAgreement.get(key) ?? []), version]);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Agreements</h1>
      <p className="mt-1 max-w-3xl text-sm text-ink-muted">
        Versioned service agreements with auditable acceptance evidence. A version that has been
        accepted even once becomes immutable — to change the wording, add a new version and
        activate it.
      </p>
      <p
        role="note"
        className="mt-3 max-w-3xl rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning"
      >
        {LAWYER_REVIEW_NOTE}
      </p>

      {params.notice ? (
        <p role="status" className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          {params.notice}
        </p>
      ) : null}
      {params.error ? (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </p>
      ) : null}

      {canManage ? (
        <details className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-e1">
          <summary className="cursor-pointer text-sm font-semibold text-brand-700">
            Create a new agreement
          </summary>
          <form action={createAgreementAction} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="title"
              required
              minLength={3}
              maxLength={200}
              placeholder="Agreement title"
              className={inputClass}
            />
            <select name="agreement_type" defaultValue="service" className={inputClass}>
              <option value="service">Service agreement</option>
              <option value="privacy">Privacy</option>
              <option value="terms">Terms</option>
              <option value="custom">Custom</option>
            </select>
            <AdminSubmitButton idleLabel="Create agreement" pendingLabel="Creating…" />
          </form>
        </details>
      ) : null}

      {agreements.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">
          No agreements yet{canManage ? " — create one above." : "."}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-5">
        {agreements.map((agreement) => {
          const agreementId = String(agreement.id);
          const currentVersionId = agreement.current_version_id
            ? String(agreement.current_version_id)
            : null;
          const agreementVersions = versionsByAgreement.get(agreementId) ?? [];
          return (
            <article
              key={agreementId}
              className="rounded-2xl border border-line bg-surface p-5 shadow-e1"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">{String(agreement.title)}</h2>
                <Badge tone={agreement.is_active ? "success" : "neutral"}>
                  {agreement.is_active ? "Active" : "Archived"}
                </Badge>
                <Badge tone="brand">/{String(agreement.slug)}</Badge>
              </div>

              {canManage && agreement.is_active ? (
                <form action={archiveAgreementAction} className="mt-3">
                  <input type="hidden" name="agreement_id" value={agreementId} />
                  <AdminSubmitButton
                    idleLabel="Archive agreement"
                    pendingLabel="Archiving…"
                    compact
                  />
                </form>
              ) : null}

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Versions of {String(agreement.title)}</caption>
                  <thead>
                    <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                      <th scope="col" className="px-3 py-2 font-medium">Version</th>
                      <th scope="col" className="px-3 py-2 font-medium">State</th>
                      <th scope="col" className="px-3 py-2 font-medium">Effective</th>
                      <th scope="col" className="px-3 py-2 font-medium">Acceptances</th>
                      <th scope="col" className="px-3 py-2 font-medium">PDF</th>
                      {canManage ? (
                        <th scope="col" className="px-3 py-2 font-medium">Actions</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {agreementVersions.length === 0 ? (
                      <tr>
                        <td colSpan={canManage ? 6 : 5} className="px-3 py-3 text-xs text-ink-muted">
                          No versions yet.
                        </td>
                      </tr>
                    ) : (
                      agreementVersions.map((version) => {
                        const versionId = String(version.id);
                        const isCurrent = versionId === currentVersionId;
                        const accepted = acceptanceCounts.get(versionId) ?? 0;
                        return (
                          <tr key={versionId} className="border-b border-line last:border-b-0">
                            <td className="px-3 py-2">
                              <p className="font-medium text-ink">v{String(version.version_number)}</p>
                              <p className="text-xs text-ink-muted">{String(version.title)}</p>
                              {version.change_note ? (
                                <p className="text-xs text-ink-muted">{String(version.change_note)}</p>
                              ) : null}
                            </td>
                            <td className="px-3 py-2">
                              {isCurrent ? (
                                <Badge tone="success">Current</Badge>
                              ) : version.is_draft ? (
                                <Badge tone="neutral">Draft</Badge>
                              ) : (
                                <Badge tone="brand">Published</Badge>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-ink-muted">
                              {version.effective_from
                                ? new Date(String(version.effective_from)).toLocaleDateString("en-IN", {
                                    dateStyle: "medium",
                                  })
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs text-ink-muted">{accepted}</td>
                            <td className="px-3 py-2 text-xs text-ink-muted">
                              {version.pdf_path ? "Stored" : "—"}
                            </td>
                            {canManage ? (
                              <td className="px-3 py-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {!isCurrent ? (
                                    <form action={activateAgreementVersionAction}>
                                      <input type="hidden" name="version_id" value={versionId} />
                                      <AdminSubmitButton
                                        idleLabel="Activate"
                                        pendingLabel="Activating…"
                                        compact
                                      />
                                    </form>
                                  ) : null}
                                  <form action={generateAgreementVersionPdfAction}>
                                    <input type="hidden" name="version_id" value={versionId} />
                                    <AdminSubmitButton
                                      idleLabel="Generate PDF"
                                      pendingLabel="Generating…"
                                      compact
                                    />
                                  </form>
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {canManage ? (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-medium text-brand-700">
                    Add a new version
                  </summary>
                  <form action={createAgreementVersionAction} className="mt-3 grid gap-3">
                    <input type="hidden" name="agreement_id" value={agreementId} />
                    <input
                      name="title"
                      required
                      minLength={3}
                      maxLength={200}
                      defaultValue={String(agreement.title)}
                      aria-label="Version title"
                      className={inputClass}
                    />
                    <textarea
                      name="body"
                      required
                      minLength={50}
                      maxLength={200000}
                      rows={12}
                      placeholder="Agreement text (markdown — ## headings for numbered sections)"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus-ring"
                    />
                    <input
                      name="change_note"
                      maxLength={500}
                      placeholder="What changed in this version (optional)"
                      className={inputClass}
                    />
                    <div>
                      <AdminSubmitButton idleLabel="Save draft version" pendingLabel="Saving…" />
                    </div>
                  </form>
                </details>
              ) : null}
            </article>
          );
        })}
      </div>

      {!canManage ? (
        <p className="mt-3 text-xs text-ink-muted">Only admins can modify agreements.</p>
      ) : null}
      <p className="mt-4 text-xs text-ink-muted">
        Acceptance evidence PDFs are generated automatically for every sign-up, contact and quote
        submission and stored privately in Supabase Storage.
      </p>
    </section>
  );
}
