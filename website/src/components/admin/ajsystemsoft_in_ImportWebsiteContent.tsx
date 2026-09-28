import { DownloadCloud } from "lucide-react";
import { AdminActionForm } from "./AdminActionForm";
import { importWebsiteContentAction } from "@/lib/admin/ajsystemsoft_in_import-actions";

/** Modules whose public pages show built-in content while the table is empty. */
const IMPORT_HINTS: Record<string, string> = {
  services: "The website shows its 15 built-in services until they exist here.",
  posts: "The blog shows 3 built-in articles until posts exist here (categories & tags are added too).",
  navigation: "The header menu shows the built-in links until a header item exists here.",
  "hub-links": "The Let's talk panel shows WhatsApp, Call, Email, Start project, Discuss and Google review. Import them to edit, reorder or hide each one.",
};

/** "Import from website" banner: copies what the site shows into this module. */
export function ImportWebsiteContent({ resource }: { resource: string }) {
  const hint = IMPORT_HINTS[resource];
  if (!hint) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-600/20 bg-brand-50 px-4 py-3">
      <p className="max-w-2xl text-sm text-ink">
        <strong className="font-semibold">Website content:</strong> {hint} Existing records are never changed or duplicated.
      </p>
      <AdminActionForm action={importWebsiteContentAction}>
        <input type="hidden" name="resource" value={resource} />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-700 focus-ring"
        >
          <DownloadCloud aria-hidden="true" className="h-4 w-4" />
          Import from website
        </button>
      </AdminActionForm>
    </div>
  );
}
