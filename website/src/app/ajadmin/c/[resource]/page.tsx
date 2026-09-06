import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceList } from "@/components/admin/ResourceList";
import { getResourceConfig, isResourceKey, listResourceRows } from "@/lib/admin/crud";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  const config = getResourceConfig(resource);
  return { title: { absolute: `AJS Admin — ${config?.label ?? "Not found"}` } };
}

export default async function ResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ page?: string; q?: string; status?: string; view?: string }>;
}) {
  const { resource } = await params;
  const config = getResourceConfig(resource);
  if (!config || !isResourceKey(resource)) notFound();
  if (!isSupabaseConfigured) return <SetupNotice module={config.label} />;

  const user = await getCurrentUser();
  const readCapability = `${config.capability}:read` as Parameters<typeof can>[1];
  if (!user || !can(user.role, readCapability)) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{config.label}</h1>
        <p
          role="alert"
          className="mt-4 max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          {user
            ? `Your role (${user.role}) does not include access to this module.`
            : "Session expired — sign in again."}
        </p>
      </section>
    );
  }

  const query = await searchParams;
  const page = Number.parseInt(query.page ?? "1", 10) || 1;
  const result = await listResourceRows(config, {
    page,
    q: query.q,
    status: query.status,
    view: query.view,
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{config.label}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Create, edit, publish and organise {config.label.toLowerCase()}.
      </p>
      <div className="mt-5">
        <ResourceList
          config={config}
          result={result}
          q={query.q ?? ""}
          status={query.status ?? ""}
          view={query.view ?? ""}
        />
      </div>
    </section>
  );
}
