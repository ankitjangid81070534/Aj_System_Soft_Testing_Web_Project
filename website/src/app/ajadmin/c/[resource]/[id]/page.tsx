import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { getResourceConfig, getResourceRow } from "@/lib/admin/crud";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  const config = getResourceConfig(resource);
  if (!config) notFound();
  if (!isSupabaseConfigured) return <SetupNotice module={config.label} />;

  const user = await getCurrentUser();
  const readCapability = `${config.capability}:read` as Parameters<typeof can>[1];
  if (!user || !can(user.role, readCapability)) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          {user
            ? `Your role (${user.role}) does not include access to this module.`
            : "Session expired — sign in again."}
        </p>
      </section>
    );
  }

  const row = await getResourceRow(config, id);
  if (!row) notFound();

  // Remote select options (blog posts pick a category).
  const selectOptions: Record<string, { value: string; label: string }[]> = {};
  if (config.key === "posts" && isSupabaseConfigured) {
    const admin = createSupabaseAdminLooseClient();
    const { data } = await admin.from("blog_categories").select("id, name").order("name");
    selectOptions.category_id = [
      { value: "", label: "No category" },
      ...(data ?? []).map((rowItem) => ({
        value: String(rowItem.id),
        label: String(rowItem.name),
      })),
    ];
  }

  return (
    <section>
      <Link
        href={`/ajadmin/c/${config.section}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink focus-ring rounded-sm"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to {config.label}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Edit {config.singular.toLowerCase()}
        </h1>
        {typeof row.status === "string" ? <StatusPill status={row.status} /> : null}
        {row.deleted_at ? <StatusPill status="inactive" /> : null}
      </div>
      <div className="mt-5">
        <ResourceForm config={config} row={row} selectOptions={selectOptions} />
      </div>
    </section>
  );
}
