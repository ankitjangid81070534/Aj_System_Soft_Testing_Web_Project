import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { getResourceConfig } from "@/lib/admin/crud";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function ResourceNewPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const config = getResourceConfig(resource);
  if (!config) notFound();
  if (!isSupabaseConfigured) return <SetupNotice module={config.label} />;

  const user = await getCurrentUser();
  const writeCapability = `${config.capability}:write` as Parameters<typeof can>[1];
  if (!user || !can(user.role, writeCapability)) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          {user
            ? `Your role (${user.role}) cannot create records here.`
            : "Session expired — sign in again."}
        </p>
      </section>
    );
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
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        New {config.singular.toLowerCase()}
      </h1>
      <div className="mt-5">
        <ResourceForm config={config} row={null} />
      </div>
    </section>
  );
}
