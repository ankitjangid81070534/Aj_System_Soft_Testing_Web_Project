import Link from "next/link";
import { FileSignature, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

export type AcceptanceItem = {
  id: string;
  acceptedAt: string;
  context: string;
  versionNumber: number;
  title: string;
  slug: string;
  hasEvidence: boolean;
};

const CONTEXT_LABELS: Record<string, string> = {
  signup: "Account sign-up",
  contact: "Contact form",
  quote: "Quote request",
  account: "Profile completion",
  admin: "Recorded by AJS",
  other: "Other",
};

/** Read-only agreement history on the client account page. */
export function AgreementsHistory({
  acceptances,
  currentVersion,
}: {
  acceptances: AcceptanceItem[];
  currentVersion: number | null;
}) {
  return (
    <section
      id="agreements"
      aria-labelledby="agreements-heading"
      className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-e2 sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <FileSignature aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="agreements-heading" className="text-xl font-semibold text-ink">Agreements</h2>
            <p className="text-xs text-ink-muted">
              Every Service Agreement version you accepted, with date and context.
            </p>
          </div>
        </div>
        <Link
          href="/service-agreement"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 focus-ring rounded-sm dark:text-brand-400"
        >
          <ScrollText aria-hidden="true" className="h-4 w-4" />
          View current agreement{currentVersion ? ` (v${currentVersion})` : ""}
        </Link>
      </div>

      {acceptances.length > 0 ? (
        <div role="region" aria-label="Accepted agreements" tabIndex={0} className="mt-5 overflow-x-auto rounded-2xl border border-line focus-ring">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Agreement versions accepted by this account</caption>
            <thead className="bg-canvas text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Agreement
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Version
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Accepted
                </th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Context
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {acceptances.map((item) => (
                <tr key={item.id} className="bg-surface">
                  <td className="px-4 py-3 font-medium text-ink">{item.title}</td>
                  <td className="px-4 py-3">
                    <Badge tone={item.versionNumber === currentVersion ? "success" : "neutral"}>
                      v{item.versionNumber}
                      {item.versionNumber === currentVersion ? " · current" : ""}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <time dateTime={item.acceptedAt}>
                      {new Date(item.acceptedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">
                    {CONTEXT_LABELS[item.context] ?? item.context}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          title="No agreements accepted yet"
          description="When you accept the Service Agreement during sign-up, a contact message or a quote request, the record appears here."
          icon={<FileSignature className="h-5 w-5" />}
        />
      )}
      <p className="mt-4 text-xs text-ink-muted">
        Need a copy of an accepted version? Contact us and quote the acceptance date — a signed
        PDF record is stored securely for each acceptance.
      </p>
    </section>
  );
}
